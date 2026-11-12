export const messages = {
  saved: 'Sauvegardé sur cet appareil',
  savingUnavailable: 'Sauvegarde indisponible ici',
  selectFirst: 'Choisis un des blocs ci-dessous pour commencer.',
  selected: 'R ou molette pour tourner. Reclique sur le bloc pour le désélectionner.',
  deselected: 'Pièce désélectionnée. Choisis un autre bloc quand tu veux.',
  invalidPlacement: 'Un peu trop serré ! Essaie ailleurs ou tourne le bloc.',
  restarted: 'Une nouvelle petite aventure. Amuse-toi bien !',
  rotation: (all, direction) => all
    ? `Les trois pièces ont tourné de 90° vers la ${direction < 0 ? 'gauche' : 'droite'}.`
    : `Un quart de tour vers la ${direction < 0 ? 'gauche' : 'droite'} (90°).`,
  placed: result => result.count
    ? `${result.count} ${result.count === 1 ? 'ligne effacée' : 'lignes effacées'} ! +${result.gained} points.`
    : `Parfaitement placé ! +${result.gained} points.`,
  sizeChanged: size => `Ta petite bulle ${size} × ${size}. Chaque taille conserve sa propre progression.`,
};

export const helpHTML = `
  <span class="eyebrow">PRENDS TON TEMPS</span>
  <h2>Un petit guide</h2>
  <ol>
    <li>Glisse un bloc sur la grille, ou sélectionne-le puis touche une case pour y placer son coin supérieur gauche.</li>
    <li>Sélectionne une pièce puis appuie sur Tourner 90° ou sur R : chaque pression la fait pivoter de 90° vers la droite.
      Sans sélection, les trois pièces tournent à la fois. La molette tourne la pièce sélectionnée : vers le haut à gauche, vers le bas à droite.
      Un second clic sur la pièce la désélectionne. La rotation est gratuite et illimitée.</li>
    <li>Chaque bloc placé est immédiatement remplacé. Les deux autres restent disponibles.
      Les nouvelles pièces favorisent les espaces libres de ta grille, sans répéter celle que tu viens de jouer.</li>
    <li>Complète des lignes ou des colonnes pour les effacer. La partie se termine quand aucun bloc ne peut être placé, même après rotation.</li>
  </ol>
  <p><b>Points :</b> 10 points par case placée, plus 100 × le nombre de lignes effacées au carré à chaque coup.
    Les coups consécutifs qui effacent des lignes ajoutent 50 points de bonus supplémentaires à chaque coup de la série.</p>
  <p><b>Clavier :</b> 1–3 pour choisir un bloc ; R pour tourner ; les flèches pour se déplacer ;
    Entrée ou Espace pour placer. Échap annule la sélection.</p>
  <p>Chaque taille de grille conserve ses propres scores et sa partie en cours dans ce navigateur.
    Effacer ses données supprime les sauvegardes.</p>`;
