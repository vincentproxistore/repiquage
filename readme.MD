1. Préparer le csv en respectant la strucure appropriée (une ligne par magasin) et la placer dans le dossier input en le nommant info.csv

EXAMPLE

ACCOUNT ID,ACCOUNTNAME,CLICKTAG,
9012779,TEGEL,https://partners.quick-step.com/nl-BE/tegel-concept-overijse-hq,
9010741,LA BOISERIE SA,https://partners.quick-step.com/fr-BE/la-boiserie-sa,

2. copier les infos des visuels (js, html, css,...) dans le dossier du format approprié. (./input/half-page)
  Ne surtout pas modifer le nom des dossier dans input...

3. lancer la commande [npm run start] dans le terminal et ouvrez votre navigateur sur http:localhost:8000 



FONCTIONNEMENT DU SCRIPT

Il va lire le fichier csv  et pour chaque ligne du csv (magasin) le scrpit va lire copier les templates des visuels il va créer un structure contenant un fichier html par magasin et par format (half-page, rectangle, leaderboard) dans le dossier ouput.

Ce dossier continedra les visuels zippés à uploader sous la plateforme 