import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  build: {
    // Vites varning går på okomprimerad storlek, och standardtaket är 500 kB.
    // Det som faktiskt hämtas är gzippat: startsidan 173 kB och konceptvyerna
    // 102 kB till. Taket här är satt strax ovanför det vi accepterar i dag, så
    // att en verklig ökning fortfarande varnar i stället för att en varning vi
    // bestämt oss för att ignorera går igång vid varje bygge.
    //
    // Höj det inte för att bli av med en varning. Ta reda på vad som växte.
    chunkSizeWarningLimit: 700,
  },
});
