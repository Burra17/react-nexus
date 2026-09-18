import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { memo, useState } from 'react';
import { RenderCounter } from '../../../shared/components/renderCounter';

type Settings = { label: string };

type ChildProps = {
  title: string;
  settings: Settings;
};

// Samma objekt varje gång. Det ligger utanför komponenten och skapas därför en
// gång när filen laddas, inte om vid varje render.
const stableSettings = { label: 'samma objekt varje gång' };

// Ett barn. De två nedan är samma komponent - det enda som skiljer är memo.
//
// settings läses aldrig här. Den finns för att vara en prop att jämföra, och
// vad den innehåller står hos föräldern: båda barnen får samma objekt. Skrevs
// det ut i varje kort skulle två identiska rader se ut som två uppgifter, och
// dra uppmärksamhet från det enda som faktiskt skiljer korten - räknaren.
const Child = ({ title }: ChildProps) => (
  <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
    <Typography sx={{ fontWeight: 600, mb: 1 }}>{title}</Typography>
    <RenderCounter />
  </Paper>
);

// memo hoppar över barnet om alla props är lika som förra gången.
// Jämförelsen sker på referens, inte på innehåll.
const MemoChild = memo(Child);

export const RenderTriggerDemo = () => {
  const [count, setCount] = useState(0);
  const [newObjectEachRender, setNewObjectEachRender] = useState(false);

  // Med reglaget på skapas ett nytt objekt varje gång komponenten körs.
  // Innehållet är identiskt, men referensen är ny - och det är referensen
  // memo tittar på.
  const settings = newObjectEachRender ? { label: 'nytt objekt varje gång' } : stableSettings;

  return (
    <Stack spacing={2}>
      <Typography variant="h3" component="p">
        Förälderns state: {count}
      </Typography>

      <Button variant="contained" onClick={() => setCount(count + 1)} sx={{ alignSelf: 'flex-start' }}>
        Ändra förälderns state
      </Button>

      {/* Sidans enda not om StrictMode sitter här. Barnen nedan får den inte:
          memo-barnets siffra står still, och då hade noten sagt emot demon. */}
      <RenderCounter showStrictModeNote />

      <FormControlLabel
        control={<Switch checked={newObjectEachRender} onChange={(event) => setNewObjectEachRender(event.target.checked)} />}
        label="Skicka ett nyskapat objekt som prop"
      />

      {/* Propen står här, en gång, eftersom det är samma objekt som går till
          båda barnen. Det är hela uppställningen: identisk prop, olika utfall. */}
      <Typography variant="body2" color="textSecondary">
        Båda barnen får <strong>{settings.label}</strong>.
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Child title="Vanligt barn" settings={settings} />
        <MemoChild title="Barn i React.memo" settings={settings} />
      </Stack>
    </Stack>
  );
};
