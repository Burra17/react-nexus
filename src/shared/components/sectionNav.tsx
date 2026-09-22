import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useEffect, useState } from 'react';
import { ACTIVE_SECTION_ROOT_MARGIN, APPBAR_HEIGHT, conceptSections } from './conceptSections';

// Vilken sektion man befinner sig i.
//
// Remsan som observeras är smal och ligger strax under sektionsraden: en rubrik
// räknas som aktuell när den passerar toppen av läsytan, inte när den syns
// någonstans på skärmen. Utan den nedre begränsningen vore alla fyra rubriker
// "synliga" samtidigt på en hög skärm, och markeringen skulle stå still.
const useActiveSection = () => {
  const [active, setActive] = useState<string>(conceptSections[0].id);

  useEffect(() => {
    const headings = conceptSections.map((section) => document.getElementById(section.id)).filter((el) => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);

        if (visible.length === 0) {
          return;
        }

        // Flera rubriker kan hamna i remsan samtidigt vid snabb scroll. Den som
        // ligger överst vinner, så markeringen följer läsriktningen.
        const topmost = visible.reduce((a, b) => (a.boundingClientRect.top < b.boundingClientRect.top ? a : b));
        setActive(topmost.target.id);
      },
      { rootMargin: ACTIVE_SECTION_ROOT_MARGIN },
    );

    headings.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, []);

  return active;
};

// Sektionsraden som fastnar under rubrikraden.
//
// Vågrät och inte en högerspalt: en spalt hade krympt innehållet till ~944 px,
// och kodblocken behöver 1149 px för att slippa scrolla i sidled. Se #67.
export const SectionNav = () => {
  const active = useActiveSection();

  return (
    <Box
      component="nav"
      aria-label="Sidans avsnitt"
      sx={{
        position: 'sticky',
        top: APPBAR_HEIGHT,
        zIndex: 1,

        // Ogenomskinlig bakgrund, inte backdrop-filter. Designlinjen är "djup
        // aldrig": inga gradienter, ingen glöd, inga glaseffekter. Raden lånar
        // AppBar:ens formspråk i stället - platt, med en tunn underkant.
        bgcolor: 'background.default',
        borderBottom: 1,
        borderColor: 'divider',
        py: 1,
      }}
    >
      <Stack direction="row" spacing={1} component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
        {conceptSections.map((section) => {
          const isActive = section.id === active;

          return (
            <Box component="li" key={section.id}>
              <Box
                component="a"
                href={`#${section.id}`}
                // aria-current är hur en skärmläsare får veta var man befinner
                // sig. Färgen ensam säger ingenting till den som inte ser den.
                aria-current={isActive ? 'location' : undefined}
                sx={{
                  display: 'block',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  textDecoration: 'none',
                  fontSize: 14,

                  // Markeringen bärs av tre saker, inte bara färgen: färg, vikt
                  // och en ifylld bakgrund. Samma regel som startsidans kort.
                  color: isActive ? 'primary.main' : 'text.secondary',
                  fontWeight: isActive ? 600 : 400,
                  bgcolor: isActive ? 'action.selected' : 'transparent',
                  '&:hover': { bgcolor: 'action.hover', color: isActive ? 'primary.main' : 'text.primary' },
                }}
              >
                {section.label}
              </Box>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};
