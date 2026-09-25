import CancelOutlined from '@mui/icons-material/CancelOutlined';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Paper from '@mui/material/Paper';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  readModuleAnswers,
  resetModule,
  saveAnswer,
  type AnswerChoice,
  type ModuleAnswers,
  type QuizAnswer,
} from '../../services/storage/quizStorage';

// Ett svarsalternativ.
//
// explanation visas efter svaret för alla tre alternativen, inte bara för det
// man valde. Den som gissade rätt ska också få veta varför det var rätt -
// annars går hen vidare i tron att hen kunde det.
export type QuizOption = {
  id: AnswerChoice;
  text: string;
  explanation: string;
};

// En fråga.
//
// id är stabilt och skrivs för hand i kebab-case. Aldrig index i listan: läggs
// en fråga till i mitten flyttas alla lagrade svar ett steg, och då står det
// att du svarat på en fråga du aldrig sett.
export type QuizQuestion = {
  id: string;
  question: string;
  options: QuizOption[];
  correct: AnswerChoice;
};

// Gör `kod` i en textsträng till riktiga code-element.
//
// Frågorna ligger som rena strängar i .ts-filer och inte som JSX - det var hela
// poängen med att skilja data från komponent. Backticks blir därför markeringen,
// samma som i Markdown, och den här funktionen är det som gör dem till element.
// Den som skriver en ny fråga behöver inte veta något om React.
//
// Ett rent <code>, aldrig Typography component="code". Typography sätter
// font-family från temat och slår då ut CssBaseline-regeln för code, så
// fragmentet hade renderats i brödtextens typsnitt - vilket är precis det vi
// försöker undvika här.
const withInlineCode = (text: string) => text.split('`').map((del, index) => (index % 2 === 1 ? <code key={index}>{del}</code> : del));

// Kopplar lagringen till komponentens state.
//
// Ligger i samma fil som komponenten eftersom den har exakt en användare.
// Dashboarden i #54 kommer inte behöva den - att räkna framsteg är en läsning
// direkt ur services/storage/, inte en interaktion med låsning och omsvar.
const useQuizProgress = (modulePath: string) => {
  const [answers, setAnswers] = useState<ModuleAnswers>(() => readModuleAnswers(modulePath));

  const answer = (questionId: string, choice: AnswerChoice) => {
    saveAnswer(modulePath, questionId, choice);

    // State uppdateras oavsett om skrivningen lyckades. Är lagringen avstängd,
    // som i Safaris privata läge, ska quizen ändå fungera under sessionen - den
    // blir bara inte ihågkommen. Att läsa tillbaka ur lagringen i stället hade
    // gett en quiz där ingenting händer när man klickar.
    setAnswers((current) => ({ ...current, [questionId]: { choice, answeredAt: new Date().toISOString() } }));
  };

  const reset = () => {
    resetModule(modulePath);
    setAnswers({});
  };

  return { answers, answer, reset };
};

type QuizItemProps = {
  question: QuizQuestion;
  index: number;
  answer?: QuizAnswer;
  onAnswer: (questionId: string, choice: AnswerChoice) => void;
};

const QuizItem = ({ question, index, answer, onAnswer }: QuizItemProps) => {
  const isAnswered = answer !== undefined;
  const isCorrect = answer?.choice === question.correct;
  const labelId = `fraga-${question.id}`;

  return (
    <Paper variant='outlined' sx={{ p: 3 }}>
      <FormControl sx={{ display: 'flex' }}>
        <FormLabel id={labelId} sx={{ mb: 1.5, color: 'text.primary', '&.Mui-focused': { color: 'text.primary' } }}>
          {index + 1}. {withInlineCode(question.question)}
        </FormLabel>

        <RadioGroup
          aria-labelledby={labelId}
          value={answer?.choice ?? ''}
          // aria-disabled i stället för disabled. Ett disablat fält går inte att
          // fokusera, och då kommer den som använder skärmläsare inte åt att gå
          // tillbaka och höra vad hen svarade. Klicket stoppas i handlern i
          // stället, så alternativen står kvar läsbara och nåbara.
          aria-disabled={isAnswered}
          onChange={(event) => {
            // Svaret låses vid första valet. Kan man klicka runt tills rutan blir
            // grön är det en gissningsövning och inte en kunskapskontroll.
            if (isAnswered) {
              return;
            }
            onAnswer(question.id, event.target.value as AnswerChoice);
          }}
        >
          {question.options.map((option) => (
            <FormControlLabel
              key={option.id}
              value={option.id}
              control={<Radio />}
              label={
                <>
                  {option.id.toUpperCase()}. {withInlineCode(option.text)}
                </>
              }
              sx={{
                alignItems: 'flex-start',
                mx: 0,
                mb: 0.5,
                py: 0.75,
                pr: 1.5,
                borderRadius: 1,
                '& .MuiRadio-root': { pt: 0.25 },

                // Hela raden är redan klickbar: FormControlLabel renderar ett
                // <label> som omsluter radion. Hovern finns för att visa det -
                // utan den ser bara den lilla cirkeln ut som träffytan.
                //
                // action.hover är rätt token just här. Den är ljusare än
                // underlaget i mörkt läge och mörkare i ljust, alltså alltid en
                // markering av det man pekar på.
                ...(isAnswered
                  ? // Efter låsningen svarar raden inte längre. Då ska den
                    // inte heller se ut att göra det.
                    { cursor: 'default' }
                  : { '&:hover': { bgcolor: 'action.hover' } }),
              }}
            />
          ))}
        </RadioGroup>
      </FormControl>

      {/* Regionen ligger i DOM:en från början, tom. En aria-live-region som
          monteras samtidigt som sitt innehåll annonseras ofta inte alls -
          skärmläsaren måste ha sett regionen innan den ändras. */}
      <Box aria-live='polite' sx={{ mt: isAnswered ? 2 : 0 }}>
        {isAnswered && (
          // Facit får en egen platta med kant, så att gränsen mot frågan och
          // alternativen syns. background.default är nedtonad mot kortets
          // background.paper i båda färglägena - uppmätt, inte antaget: 27→20 i
          // mörkt läge och 255→247 i ljust. action.hover hade tonat åt olika
          // håll i de två lägena och därför känts som två olika ytor.
          <Box sx={{ bgcolor: 'background.default', border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}>
            <Stack spacing={1.5}>
              <Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
                {isCorrect ? <CheckCircleOutlined color='success' fontSize='small' /> : <CancelOutlined color='error' fontSize='small' />}

                {/* Ordet står bredvid ikonen. En status som bara syns på färg eller
                  form når inte den som inte uppfattar skillnaden. */}
                <Typography sx={{ fontWeight: 600, color: isCorrect ? 'success.main' : 'error.main' }}>{isCorrect ? 'Rätt' : 'Fel'}</Typography>
              </Stack>

              {question.options.map((option) => (
                <Typography key={option.id} variant='body2' color='textSecondary'>
                  {/* Rätt och fel skrivs ut av komponenten, inte av texten. Då kan
                    en ny fråga inte råka sakna markeringen, och förklaringen får
                    handla om varför i stället för om vilket. */}
                  <Box component='span' sx={{ fontWeight: 600, color: option.id === question.correct ? 'success.main' : 'inherit' }}>
                    {option.id.toUpperCase()}. {option.id === question.correct ? 'Rätt.' : 'Fel.'}
                  </Box>{' '}
                  {withInlineCode(option.explanation)}
                  {option.id === answer.choice && ' — ditt svar.'}
                </Typography>
              ))}
            </Stack>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

type QuizProps = {
  questions: QuizQuestion[];
};

// Kunskapskontrollen sist i en konceptvy.
//
// Att känna igen en förklaring känns som kunskap men förutsäger inte att man
// kan återkalla den senare. Det gör bara ett test.
export const Quiz = ({ questions }: QuizProps) => {
  // Modulens path kommer ur routern och skickas inte som prop. En path som
  // skrivs för hand kan stavas fel - '/State' i stället för '/state' - och då
  // hamnar svaren under en nyckel ingen läser, utan att något varnar.
  const { pathname } = useLocation();
  const { answers, answer, reset } = useQuizProgress(pathname);

  const answeredCount = questions.filter((question) => answers[question.id] !== undefined).length;
  const correctCount = questions.filter((question) => answers[question.id]?.choice === question.correct).length;
  const allAnswered = answeredCount === questions.length;

  return (
    <Stack spacing={2}>
      {questions.map((question, index) => (
        <QuizItem key={question.id} question={question} index={index} answer={answers[question.id]} onAnswer={answer} />
      ))}

      {/* Samma skäl som ovan: regionen finns från början så att summeringen
          hinner annonseras när sista frågan besvarats. */}
      <Box aria-live='polite'>
        <Stack direction='row' spacing={2} sx={{ alignItems: 'center', minHeight: 36 }}>
          {/* Ingen poängsamling, inga streaks, inga märken. Syftet är att avslöja
              var förståelsen inte sitter, inte att belöna. */}
          {allAnswered && (
            <Typography variant='body2' color='textSecondary'>
              {correctCount} av {questions.length} rätt.
            </Typography>
          )}

          {answeredCount > 0 && (
            <Button variant='outlined' size='small' onClick={reset}>
              Gör om quizen
            </Button>
          )}
        </Stack>
      </Box>
    </Stack>
  );
};
