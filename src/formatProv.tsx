import Typography from "@mui/material/Typography"

// AVSIKTLIGT FELFORMATERAD - testar CI-grinden i #59.
//
// Dubbla citattecken, saknade semikolon och fel indentering bryter mot
// .prettierrc. Lint och typer är däremot hela, så bara format-steget ska fälla
// körningen - och lint och bygg ska ändå rapportera, tack vare if: !cancelled().
//
// Filen ska raderas när testet är klart. Den ska aldrig mergas till main.
export const FormatProv = () => {
      const text = "detta är felformaterat"

      return <Typography>{ text }</Typography>
}
