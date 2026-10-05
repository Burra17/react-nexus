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

// Vad läsaren gjorde senast. Förklaringen under korten byggs ur det, så att
// den visas först efter ett tryck och beskriver just det trycket.
type LastAction = 'click' | 'toggle' | null;

// Samma objekt varje gång. Det ligger utanför komponenten och skapas därför en
// gång när filen laddas, inte om vid varje render.
const stableSettings: Settings = { label: 'kort' };

// Ett barn. De två nedan är samma komponent. Det enda som skiljer är memo.
//
// settings läses aldrig här. Den finns för att vara en prop att jämföra, och
// vad den innehåller står hos föräldern: båda barnen får samma objekt. Skrevs
// det ut i varje kort skulle två identiska rader se ut som två uppgifter, och
// dra uppmärksamhet från det enda som faktiskt skiljer korten: räknaren.
const Child = ({ title }: ChildProps) => (
  <Paper variant='outlined' sx={{ p: 2, flex: 1 }}>
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
  const [lastAction, setLastAction] = useState<LastAction>(null);

  // Med reglaget på skapas ett nytt objekt varje gång komponenten körs.
  // Innehållet är identiskt, men referensen är ny, och det är referensen
  // memo tittar på.
  const settings = newObjectEachRender ? { label: 'kort' } : stableSettings;

  // Båda anropen görs i samma klickhanterare, så React ritar om en gång för
  // dem tillsammans. Förklaringen kostar alltså ingen extra ritning.
  const handleClick = () => {
    setCount(count + 1);
    setLastAction('click');
  };

  const handleToggle = (checked: boolean) => {
    setNewObjectEachRender(checked);
    setLastAction('toggle');
  };

  return (
    <Stack spacing={2}>
      <Typography variant='h3' component='p'>
        Förälderns state: {count}
      </Typography>

      <Button variant='contained' onClick={handleClick} sx={{ alignSelf: 'flex-start' }}>
        Ändra förälderns state
      </Button>

      {/* Sidans enda not om StrictMode sitter här. Barnen nedan får den inte:
          memo-barnets siffra står still, och då hade noten sagt emot demon. */}
      <RenderCounter showStrictModeNote />

      <FormControlLabel
        control={<Switch checked={newObjectEachRender} onChange={(event) => handleToggle(event.target.checked)} />}
        label='Skapa ett nytt objekt till settings vid varje ritning'
      />

      {/* Propen står här, en gång, eftersom det är samma objekt som går till
          båda barnen. Det är hela uppställningen: identisk prop, olika utfall. */}
      <Typography variant='body2' color='textSecondary'>
        Båda barnen får propen <code>settings</code> med innehållet <code>{"{ label: 'kort' }"}</code>, och just nu är det{' '}
        {newObjectEachRender ? 'ett nytt objekt vid varje ritning' : 'samma objekt vid varje ritning'}.
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Child title='Vanligt barn' settings={settings} />
        <MemoChild title='Barn i memo' settings={settings} />
      </Stack>

      {lastAction === 'click' && !newObjectEachRender && (
        <Typography color='textSecondary'>
          Föräldern ritades om, och det vanliga barnet följde med. Memo-barnet fick samma titel och samma objekt som förra gången, så varje prop var
          lika, och React hoppade över det.
        </Typography>
      )}

      {lastAction === 'toggle' && (
        <Typography color='textSecondary'>
          Reglaget är ett eget state i föräldern, så föräldern ritades om. <code>settings</code> byttes samtidigt mot ett annat objekt, och därför
          ritades memo-barnet också om, en gång. Det händer åt båda hållen. Tryck på knappen för att se vad som händer sedan.
        </Typography>
      )}

      {lastAction === 'click' && newObjectEachRender && (
        <Typography color='textSecondary'>
          Föräldern skapade ett nytt objekt med samma innehåll som förra gången. memo jämför referensen, såg en ändrad prop och ritade om barnet.
          Memo-barnet följer nu med vid varje tryck, precis som det vanliga, och memo gör ingen nytta.
        </Typography>
      )}
    </Stack>
  );
};
