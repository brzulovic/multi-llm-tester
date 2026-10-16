export interface PromptPreset {
  id: string;
  title: string;
  subtitle: string;
  prompt: string;
  category?: string;
}

export const NERDY_KINGS_PROMPTS: PromptPreset[] = [
  {
    "id": "nerdy-1-os-web",
    "title": "1. 🌐 Environnement Web (OS)",
    "subtitle": "OS de bureau complet en HTML/CSS/JS",
    "category": "Nerdy Kings",
    "prompt": "Construis un environnement web complet simulant un système d’exploitation de bureau en utilisant uniquement HTML, CSS et JavaScript, le tout dans un seul fichier directement exécutable dans Google Chrome. L’interface doit ressembler à un véritable OS avec une barre des tâches, des icônes, des fenêtres déplaçables et une gestion basique des fenêtres (ouvrir, fermer, minimiser).\n\nLe système doit inclure au moins cinq applications différentes (comme un bloc-notes, une calculatrice, un explorateur de fichiers, etc.), toutes réellement interactives et fonctionnelles. Parmi ces applications, au moins deux doivent être des jeux jouables, dont un avec un rendu 3D simple (type WebGL ou équivalent).\n\nAjoute également un système de personnalisation permettant de modifier le bureau (changement de fond d’écran, couleurs ou thèmes). Intègre une fonctionnalité spéciale de ton choix qui améliore l’expérience globale, puis explique brièvement en quoi elle consiste et pourquoi elle est intéressante.\n\nRenvoie uniquement le code final."
  },
  {
    "id": "nerdy-clone-macos",
    "title": "Clone MacOS",
    "subtitle": "Interface desktop MacOS complète",
    "category": "Nerdy Kings",
    "prompt": "Crée une interface complète inspirée de MacOS, entièrement en HTML, CSS et JavaScript vanilla, dans un seul fichier si possible. Je veux un rendu très propre, moderne, fluide et visuellement premium, comme un vrai desktop Mac.\n\nExigences :\n\n- Génère une fausse interface de bureau type MacOS, fullscreen, responsive, avec un design très réaliste.\n- Ajoute une barre de menu en haut, style MacOS, avec logo Apple à gauche, menus (Finder, File, Edit, View, Go, Window, Help), heure à droite, icônes système (Wi-Fi, batterie, recherche, centre de contrôle).\n- Ajoute un dock en bas avec effet glassmorphism / blur, icônes bien espacées, animation au survol type magnification MacOS.\n- Mets plusieurs applications cliquables dans le dock et/ou sur le bureau :\n  - Finder\n  - Safari\n  - Terminal\n  - Notes\n  - App Store\n  - Settings\n  - Music\n- Chaque app doit s’ouvrir dans une vraie fenêtre draggable.\n- Les fenêtres doivent avoir :\n  - boutons rouge / orange / vert en haut à gauche\n  - ombre douce\n  - coins arrondis\n  - effet de transparence léger\n  - possibilité de déplacer les fenêtres à la souris\n  - possibilité de les mettre au premier plan quand on clique dessus\n  - bouton pour fermer la fenêtre\n  - bouton pour minimiser\n  - bouton pour maximiser / restaurer\n- Ajoute un bureau avec wallpaper élégant style MacOS Sonoma / Ventura.\n- Ajoute quelques icônes sur le bureau (Documents, Projects, Trash, Images).\n- Implémente un Finder basique avec sidebar + liste de fichiers fictifs.\n- Implémente Safari avec une fausse barre d’adresse et une page d’accueil.\n- Implémente Terminal avec quelques commandes fake fonctionnelles comme :\n  - help\n  - clear\n  - date\n  - whoami\n  - ls\n- Implémente Notes avec une zone de texte éditable.\n- Ajoute des animations fluides à l’ouverture / fermeture des fenêtres.\n- Ajoute un effet glassmorphism moderne sur certains éléments.\n- Utilise un fond, des lumières, des ombres et des contrastes qui donnent vraiment l’impression d’un OS premium.\n- Le code doit être propre, bien structuré et facilement modifiable.\n- Pas de librairie externe, sauf si absolument nécessaire.\n- Tout doit être fonctionnel directement en ouvrant le fichier HTML dans un navigateur.\n- Le rendu doit être impressionnant visuellement, presque comme une démo de faux système d’exploitation.\n\nImportant :\n- Renvoie uniquement le code final.\n- Ne donne aucune explication.\n- Fais quelque chose de très poussé visuellement, pas une version simpliste ou scolaire."
  },
  {
    "id": "nerdy-2-maquette-to-site",
    "title": "2. 🎨 Maquette → Site Web",
    "subtitle": "Intégration front-end moderne & responsive",
    "category": "Nerdy Kings",
    "prompt": "Transforme cette maquette en un site web moderne, élégant et entièrement responsive, mettant en valeur des compétences front-end avancées.\n\nLe site doit inclure des animations fluides, une excellente expérience utilisateur, une hiérarchie visuelle claire et un design propre et professionnel. Le code doit être structuré, lisible et optimisé.\n\nRenvoie uniquement le code final."
  },
  {
    "id": "nerdy-3-image-to-svg",
    "title": "3. 🧩 Image → SVG",
    "subtitle": "Version vectorielle SVG fidèle",
    "category": "Nerdy Kings",
    "prompt": "Génère une version vectorielle (SVG) fidèle et détaillée de cette image.\n\nLe SVG doit être propre, optimisé et structuré, tout en conservant les formes, proportions et éléments visuels importants.\n\nRenvoie uniquement le code SVG."
  },
  {
    "id": "nerdy-4-plante-3d",
    "title": "4. 🌱 Simulation Plante 3D",
    "subtitle": "Croissance d’une graine vers une plante",
    "category": "Nerdy Kings",
    "prompt": "Conçois et développe une simulation de croissance d’une plante en 3D qui illustre visuellement l’évolution d’une graine jusqu’à une plante ou un arbre entièrement formé au fil du temps.\n\nLa simulation doit montrer clairement les différentes étapes de croissance, incluant la germination, le développement de la tige, ainsi que l’apparition des feuilles ou des branches, avec une animation fluide et progressive plutôt qu’instantanée.\n\nL’utilisateur doit pouvoir interagir avec la simulation en ajustant des paramètres tels que la vitesse de croissance, la taille globale de la plante et un facteur d’aléatoire influençant sa forme. La croissance doit se faire en temps réel, avec une option pour réinitialiser la simulation à tout moment.\n\nLe rendu doit être organique, visuellement agréable et crédible sans nécessiter une précision scientifique parfaite.\n\nTu peux utiliser n’importe quelle bibliothèque, mais l’ensemble doit être contenu dans un seul fichier exécutable directement dans un navigateur Chrome.\n\nRenvoie uniquement le code final."
  },
  {
    "id": "nerdy-5-tir-arc",
    "title": "5. 🏹 Jeu de Tir à l’Arc 3D",
    "subtitle": "Simulation balistique, vent et progression",
    "category": "Nerdy Kings",
    "prompt": "Conçois et crée un jeu de simulation de tir à l’arc. Le jeu doit proposer des graphismes en 3D, dans le style de ton choix.\n\nLa simulation doit inclure un système de tir où le joueur utilise un arc pour lancer des flèches sur des cibles placées à des distances variables. La physique des flèches doit être affectée par la gravité, obligeant le joueur à ajuster sa visée en conséquence. De plus, un système de vent doit être implémenté, influençant la trajectoire des flèches et ajoutant un niveau de difficulté supplémentaire.\n\nLe joueur doit pouvoir contrôler la puissance et l’angle de chaque tir, avec un retour visuel pour aider à viser (par exemple : un aperçu de la trajectoire ou un guide discret). Les cibles doivent varier en position et en difficulté, et le joueur doit obtenir un score basé sur la précision et l’exactitude de ses tirs.\n\nLe jeu doit inclure un système de progression : toucher toutes les cibles permet d’accéder à une manche plus difficile, avec des facteurs comme une distance accrue, des cibles mobiles ou un vent plus fort. Si le joueur ne touche pas assez de cibles, la partie doit se terminer et revenir à un écran de démarrage.\n\nTu peux utiliser n’importe quelle bibliothèque pour cette implémentation, mais tout doit être contenu dans un seul script et jouable directement dans un navigateur Chrome.\n\n"
  },
  {
    "id": "nerdy-6-zombie-tower-defense",
    "title": "6. 🧟 Zombie Tower Defense",
    "subtitle": "Jeu 3D, tourelles et vagues d’ennemis",
    "category": "Nerdy Kings",
    "prompt": "Conçois et crée un jeu de tower defense sur le thème des zombies. Le jeu doit proposer des graphismes en 3D, dans le style de ton choix.\n\nLe jeu doit inclure une carte avec un chemin défini où des vagues de zombies avancent progressivement vers une base. Le joueur doit pouvoir placer différents types de défenses le long de la carte, notamment des tourelles basiques, des tours de sniper avec une longue portée et de gros dégâts, ainsi que des mines infligeant des dégâts de zone lorsque les ennemis passent dessus.\n\nChaque type de défense doit avoir des caractéristiques distinctes telles que la portée, la cadence de tir et les dégâts. Le joueur doit disposer de ressources limitées afin de placer et améliorer stratégiquement ses défenses. Les zombies doivent arriver en vagues de plus en plus difficiles, avec des variations comme des ennemis plus rapides ou plus résistants.\n\nLe gameplay doit inclure un système de progression clair où survivre à une vague permet d’accéder à une suivante plus difficile. Si trop de zombies atteignent la base, la partie se termine et revient à un écran de démarrage. Des retours visuels doivent être présents, comme des indicateurs de vie, des effets de dégâts et des animations d’attaque.\n\nTu peux utiliser n’importe quelle bibliothèque pour cette implémentation, mais l’ensemble du jeu doit être contenu dans un seul script et être directement jouable dans un navigateur Chrome.\n"
  },
  {
    "id": "nerdy-7-mesopotamie-3d",
    "title": "7. 🏛️ Mésopotamie 3D",
    "subtitle": "Marché antique vivant avec noclip",
    "category": "Nerdy Kings",
    "prompt": "À l’aide de JavaScript et de Three.js, réalise une scène 3D très détaillée d’un marché vivant dans un village mésopotamien antique.\n\nLa scène doit être statique mais riche visuellement, incluant des maisons en briques d’argile, des étals, des marchands, des animaux, des poteries et des tissus. L’ambiance doit être renforcée par une lumière chaude et réaliste.\n\nMets l’accent sur l’éclairage, les textures, la composition et l’immersion visuelle globale. Ajoute un mode noclip activé en appuyant sur une touche\n\nRenvoie uniquement le code final."
  },
  {
    "id": "nerdy-7-mesopotamie-fps",
    "title": "7. 🏛️ Mésopotamie (Vue FPS)",
    "subtitle": "Exploration immersive ZQSD PointerLock",
    "category": "Nerdy Kings",
    "prompt": "À l’aide de JavaScript et de Three.js, crée une scène 3D immersive représentant un marché dans un village mésopotamien antique. La scène doit être riche visuellement, avec des maisons en briques d’argile, des étals remplis de poteries, tissus, fruits et épices, ainsi que des personnages et des animaux statiques pour donner de la vie à l’environnement. L’ensemble doit être cohérent, dense et crédible, avec une attention particulière portée aux détails, aux textures et à la composition visuelle.\n\nLa scène doit être entièrement explorable en vue FPS. Le joueur doit pouvoir se déplacer avec les touches ZQSD et contrôler la caméra avec la souris grâce à PointerLockControls. La caméra doit être positionnée à une hauteur réaliste d’environ 1.7 mètre pour simuler une vraie marche dans le marché. Les déplacements doivent être fluides, avec une légère inertie pour renforcer le réalisme, et un système de collisions doit empêcher de traverser les murs, les objets et les étals.\n\nL’éclairage doit être cinématique et chaleureux, simulant une fin d’après-midi avec un soleil bas, des ombres douces et réalistes, et une ambiance globale immersive. Tu peux ajouter une légère brume ou poussière pour renforcer la profondeur de la scène. Les matériaux doivent être variés et crédibles, avec des textures détaillées pour la terre, le bois, les tissus et les briques, idéalement en utilisant un rendu de type PBR.\n\nLe code doit être complet, dans un seul fichier HTML, prêt à être exécuté directement. Utilise Three.js via CDN, sans dépendances complexes externes. Le rendu doit privilégier l’immersion, la lisibilité et les performances. Ajoute un petit overlay discret indiquant les contrôles (ZQSD + souris).\n\nRenvoie uniquement le code final."
  },
  {
    "id": "nerdy-8-theme-park",
    "title": "8. 🛹 Theme Park Simulator",
    "subtitle": "Isometric park builder in Vanilla JS",
    "category": "Nerdy Kings",
    "prompt": "Use HTML, CSS, and vanilla JavaScript to create an interactive isometric theme park simulation game that runs entirely in the browser. Build it as a polished single-page web experience with clean structure, responsive layout, and clear separation between rendering, UI, and game logic.\n\nCreate a playable isometric park-building game where I can place and remove paths, add attractions, position decorations, and expand a small theme park over time. The game should feel cohesive, charming, readable, and visually polished rather than like a rough prototype. Prioritize strong game feel, clarity, and playful feedback over realism.\n\nVisual direction:\n- Establish a cohesive premium art direction designed specifically for an isometric view.\n- Create all visuals directly in HTML/CSS/JavaScript using stylized shapes, layered UI, gradients, shadows, and simple illustrated game elements.\n- The park should include terrain tiles, paths, trees, water, food stalls, rides, decorations, buildings, icons, and UI panels.\n- Everything should feel consistent, colorful, and readable at a glance.\n- The UI should look like a real management game, with polished buttons, hover states, icons, counters, and tool panels.\n\nCore gameplay:\n- Let me place paths tile by tile.\n- Let me remove placed paths and objects.\n- Let me place attractions such as rides and stalls onto valid tiles.\n- Let me place scenery like trees, bushes, benches, lamps, and decorative objects.\n- Support a grid-based isometric map with proper tile alignment and placement previews.\n- Show valid and invalid placement states clearly.\n- Allow camera movement with smooth panning and zooming.\n- Make building interactions feel satisfying with hover feedback, ghost previews, placement highlights, and subtle animations.\n\nSimulation systems:\n- Add guest entities that spawn into the park and move believably through the path network.\n- Guests should decide where to go based on nearby rides, stalls, and available paths.\n- Include simple management systems such as:\n  - money\n  - park rating\n  - cleanliness\n  - guest happiness\n  - ride queueing\n  - ride capacity/status\n- Guests should react to the park layout and available attractions.\n- Rides should generate income and attract guests.\n- Missing paths, poor layout, or low cleanliness should reduce guest satisfaction.\n- Add janitor-style cleanliness logic in a lightweight way, even if simplified.\n\nGame feel and UX:\n- Make the experience feel complete, friendly, and stable.\n- Add clear UI panels for money, guest count, happiness, cleanliness, and selected build tool.\n- Include small animations, status indicators, and readable labels.\n- Show ride states such as open, busy, and queue size.\n- Include contextual tooltips or lightweight info panels where useful.\n- Use satisfying transitions and visual feedback when placing, deleting, or selecting objects.\n\nTechnical requirements:\n- Use plain HTML, CSS, and JavaScript only unless a lightweight library is absolutely necessary.\n- Organize the code cleanly into sections or modules for map logic, rendering, entities, UI, and simulation.\n- The game must run directly in the browser.\n- Avoid placeholder-only behavior; implement a genuinely playable loop.\n- Keep performance reasonable for a medium-sized park.\n- Make the interface intuitive without needing external explanation.\n\nPlaytesting expectations:\n- Build and expand the park through multiple rounds of play during testing.\n- Verify that path placement, ride placement, deletion, and camera navigation work smoothly.\n- Confirm that guests can navigate the park correctly and react to the layout.\n- Ensure that queueing, money generation, cleanliness, and happiness update in believable ways.\n- Check that the visuals, UI, and interactions feel cohesive, stable, and polished.\n- Fix any overlapping issues, broken pathfinding, unreadable UI, or inconsistent tile placement.\n\nDeliver a complete browser game with HTML, CSS, and JavaScript that feels like a small but polished isometric theme park simulator, with charm, clarity, and a strong sense of progression."
  },
  {
    "id": "nerdy-9-landing-page",
    "title": "9. Landing Page Guide IA",
    "subtitle": "Landing page premium Nerdy Kings",
    "category": "Nerdy Kings",
    "prompt": "Crée une landing page complète en HTML, CSS et JavaScript vanilla pour la marque “Nerdy Kings”, un site média / business autour de l’IA, de la tech et de l’automatisation.\n\nOBJECTIF DE LA PAGE :\nLa page doit capturer les emails en échange d’un guide gratuit intitulé :\n“Le guide gratuit de l’IA & de l’automatisation”\nLe but est de donner envie aux visiteurs de laisser leur email pour recevoir ce guide.\n\nSTYLE VISUEL :\n- Design moderne, premium, tech, futuriste, mais très clean\n- Univers visuel IA / startup / automatisation / innovation\n- Ambiance sombre élégante avec accents lumineux\n- Couleurs principales : noir profond, gris anthracite, blanc, avec accent bleu électrique ou violet néon\n- Look professionnel, crédible, haut de gamme\n- Responsive mobile + desktop\n- Beaucoup d’espace, belle hiérarchie visuelle, sections bien aérées\n- Animations subtiles au scroll ou sur hover\n- Effet glassmorphism ou cartes modernes possible, mais sans surcharge\n- Le rendu doit faire “média tech premium”\n\nSTRUCTURE DE LA PAGE :\n1. HERO SECTION\n- Logo texte “Nerdy Kings” en haut\n- Gros titre impactant, orienté bénéfice\n- Exemple d’idée de titre : “Le guide gratuit pour comprendre et utiliser l’IA pour automatiser plus, gagner du temps et prendre de l’avance”\n- Sous-titre clair, persuasif, qui explique ce que le guide apporte\n- Mockup visuel du guide gratuit (fausse couverture ebook stylée)\n- Formulaire de capture email visible immédiatement\n- Champ email + bouton CTA\n- CTA du type : “Recevoir le guide gratuit”\n- Petit texte de réassurance sous le formulaire : “Pas de spam. Désinscription en un clic.”\n\n2. SECTION BÉNÉFICES\nCréer 3 à 4 blocs avec icônes modernes expliquant ce que le visiteur va apprendre dans le guide :\n- Comment utiliser l’IA au quotidien\n- Comment automatiser des tâches répétitives\n- Quels outils IA valent vraiment le coup\n- Comment gagner du temps et de l’argent avec l’automatisation\n\n3. SECTION “POUR QUI ?”\nExpliquer que ce guide est utile pour :\n- créateurs de contenu\n- freelances\n- entrepreneurs\n- curieux de la tech\n- débutants qui veulent comprendre l’IA sans jargon inutile\n\n4. SECTION PREUVE / CRÉDIBILITÉ\nAjouter une section rassurante qui positionne Nerdy Kings comme une marque sérieuse sur l’IA et la tech\n- Ton crédible, intelligent, accessible\n- Petit paragraphe sur la mission de Nerdy Kings :\n  “Rendre l’IA, la tech et l’automatisation compréhensibles, concrètes et utiles.”\n- Ajouter éventuellement 2 ou 3 mini témoignages fictifs crédibles et sobres\n\n5. SECTION CTA FINALE\n- Rappeler la promesse principale\n- Répéter le formulaire email\n- Bouton fort et visible\n\n6. FOOTER\n- Logo texte Nerdy Kings\n- Petit texte copyright\n- Liens fictifs vers Mentions légales / Contact / Politique de confidentialité\n\nFONCTIONNALITÉS :\n- Le code doit être propre, bien structuré, lisible et commenté\n- Utiliser uniquement HTML, CSS et JS vanilla dans un seul fichier si possible\n- Formulaire de capture d’email visuellement fonctionnel\n- Ajouter validation simple de l’email en JavaScript\n- Prévoir un message de succès après soumission\n- Pas de backend nécessaire, mais le code doit être prêt à connecter à Mailchimp, Brevo ou ConvertKit plus tard\n- Prévoir facilement l’intégration future d’un vrai endpoint de formulaire\n\nCOPYWRITING :\nLe texte doit être rédigé directement dans la page, en français, avec un ton :\n- moderne\n- intelligent\n- clair\n- persuasif\n- orienté bénéfices\n- pas trop agressif ni trop “vendeur cheap”\n\nIMPORTANT :\n- Le résultat doit être beau dès l’ouverture du fichier\n- Je veux une vraie landing page convaincante, pas juste une maquette basique\n- Génère un rendu visuel premium, cohérent et professionnel\n- Soigne particulièrement la hero section, le formulaire email et les CTA\n- Le code final doit être directement testable dans un navigateur"
  },
  {
    "id": "nerdy-10-fps-doom",
    "title": "10. FPS Doom-like",
    "subtitle": "Jeu rétro raycasting jouable dans le navigateur",
    "category": "Nerdy Kings",
    "prompt": "Crée un jeu FPS rétro inspiré de DOOM, jouable directement dans le navigateur.\n\nObjectif :\nJe veux un clone de DOOM simple, fun et nerveux, avec un style rétro old-school. Le jeu doit être fluide, lisible, et entièrement jouable au clavier + souris.\n\nContraintes générales :\n- Utilise HTML, CSS et JavaScript uniquement\n- Tout doit tenir dans un seul fichier si possible, ou sinon dans une structure très simple\n- Aucun backend\n- Le jeu doit pouvoir être lancé localement facilement\n- Code propre, organisé et commenté\n\nStyle visuel :\n- Graphismes rétro / pseudo-3D / raycasting style DOOM ou Wolfenstein\n- Ambiance sombre, brutale, arcade\n- Murs texturés simples\n- Armes visibles à l’écran\n- Ennemis en sprites 2D qui regardent le joueur\n- HUD rétro avec vie, munitions, score\n\nGameplay demandé :\n- Déplacement fluide : ZQSD ou WASD\n- Viser avec la souris\n- Tir clic gauche\n- Sprint optionnel\n- Collision avec les murs\n- Ennemis qui se déplacent vers le joueur\n- Ennemis qui attaquent à courte ou moyenne distance\n- Système de dégâts\n- Barre de vie du joueur\n- Arme de départ : shotgun ou pistolet\n- Possibilité de ramasser des munitions et des soins\n- Plusieurs ennemis sur la map\n- Le joueur peut mourir\n- Écran de game over\n- Possibilité de recommencer une partie\n\nContenu minimum :\n- 1 niveau jouable\n- 1 arme\n- 2 types d’ennemis\n- 1 système de score ou kill count\n- 1 menu de démarrage simple\n- 1 écran de victoire ou de survie\n\nTechnique :\n- Si possible, utilise une technique de raycasting pour simuler la 3D rétro\n- Structure le code clairement : moteur, joueur, ennemis, tirs, collisions, HUD\n- Ajoute des commentaires pour expliquer les parties importantes\n- Optimise pour que le jeu tourne correctement dans un navigateur classique\n\nImportant :\n- Commence par générer la structure complète du projet\n- Puis fournis directement le code complet\n- Le jeu doit être jouable sans dépendances compliquées\n- Ne fais pas une démo vide : je veux un vrai prototype fonctionnel\n\nOption bonus si possible :\n- Effets sonores\n- Flash de tir\n- Animation simple de l’arme\n- Portes\n- Mini-map\n- Boss final"
  },
  {
    "id": "nerdy-11-village-medieval",
    "title": "11. Village Médiéval 3D",
    "subtitle": "Scène 3D ultra détaillée village français",
    "category": "Nerdy Kings",
    "prompt": "Crée une scène 3D ultra détaillée d’un village français médiéval réaliste, vue immersive au niveau du sol comme si la caméra était un personnage marchant dans le village. Architecture fidèle au Moyen Âge français : maisons à colombages avec poutres apparentes, murs en torchis, toits en tuiles anciennes ou en chaume, petites fenêtres irrégulières, enseignes en bois suspendues. Ruelles étroites en terre battue ou pavées, légèrement boueuses avec des traces de passage, flaques d’eau et irrégularités naturelles du terrain.\n\nAjoute une église en pierre au centre ou en arrière-plan avec un clocher visible, ainsi que quelques échoppes (boulanger, forgeron, marchand de tissus). Intègre des PNJ réalistes en vêtements médiévaux (paysans, marchands, enfants) avec des animations simples (marcher, discuter, transporter des sacs, nourrir des animaux). Ajoute des animaux comme des poules, des cochons ou un cheval attaché.\n\nL’environnement doit être vivant : fumée douce sortant des cheminées, tissus qui bougent légèrement avec le vent, lanternes suspendues, végétation naturelle (herbe, mousses, petits arbustes), caisses en bois, tonneaux, outils dispersés. Lumière de fin d’après-midi chaude et cinématique avec ombres longues, ambiance légèrement poussiéreuse avec un léger fog volumétrique.\n\nUtilise des matériaux PBR réalistes (bois usé, pierre rugueuse, métal oxydé), textures détaillées et éclairage global réaliste. Ajoute de la profondeur de champ légère pour un rendu cinématique. Style visuel proche d’un rendu Unreal Engine 5 ou d’un film historique, très immersif, haute qualité, sans interface, sans texte."
  },
  {
    "id": "nerdy-11-village-japonais",
    "title": "11. Village Japonais 3D",
    "subtitle": "Village traditionnel époque Edo ultra réaliste",
    "category": "Nerdy Kings",
    "prompt": "Crée une scène 3D ultra réaliste d’un village japonais médiéval (époque Edo), en vue immersive à hauteur d’homme, comme si la caméra se déplaçait dans le village. Architecture traditionnelle japonaise fidèle : maisons en bois avec toits en tuiles kawara légèrement courbés, structures en bois sombre, murs en papier shoji semi-transparents, engawa (terrasses en bois), lanternes en papier suspendues.\n\nLe village est organisé le long d’un chemin principal en terre battue ou légèrement pavé, avec des petites ruelles secondaires. Ajoute des éléments typiques : un petit sanctuaire shinto avec torii en bois, une pagode ou un temple en arrière-plan, un pont en bois au-dessus d’un ruisseau, et quelques jardins zen avec pierres et sable ratissé.\n\nIntègre des PNJ réalistes en vêtements traditionnels (kimonos, sandales geta, marchands, samouraïs, paysans), avec des animations naturelles (marcher lentement, discuter, transporter de l’eau, balayer). Ajoute des animaux comme des chiens japonais ou des oiseaux.\n\nL’environnement doit être vivant et atmosphérique : pétales de cerisiers (sakura) qui tombent doucement, bambous qui bougent avec le vent, lanternes qui oscillent légèrement, fumée fine qui sort des toits. Ajoute de la végétation dense et naturelle (érables japonais, cerisiers en fleurs, mousses, herbes).\n\nLumière cinématique de fin d’après-midi ou début de soirée, chaude avec des ombres longues, ambiance légèrement brumeuse avec fog volumétrique subtil pour renforcer la profondeur. Matériaux PBR réalistes : bois vieilli, pierre humide, papier translucide, métal patiné.\n\nStyle visuel très immersif, proche d’un rendu Unreal Engine 5, ultra détaillé, sans interface ni texte, avec une légère profondeur de champ pour un rendu cinématique professionnel."
  },
  {
    "id": "nerdy-12-forest-robot",
    "title": "12. Forest Robot 3D",
    "subtitle": "Mini jeu d’aventure 3D low poly robot vs ours",
    "category": "Nerdy Kings",
    "prompt": "Crée un mini jeu d’aventure 3D en style low poly, entièrement en HTML, CSS et JavaScript (Three.js autorisé), dans un seul fichier si possible.\n\nLe jeu doit être fluide, jouable directement dans le navigateur, avec un rendu visuel propre et moderne.\n\nConcept du jeu :\nLe joueur incarne un petit robot qui se déplace dans une forêt low poly. L’objectif est de collecter un maximum de pièces tout en évitant des ours qui se déplacent dans la map.\n\nExigences techniques et gameplay :\n\nGénère un environnement 3D low poly avec :\ndes arbres stylisés\nun sol naturel (herbe ou terrain simple)\nune ambiance visuelle cohérente (lumière douce, ombres simples)\nLe robot (joueur) :\nmodèle simple low poly\ncontrôlable au clavier (ZQSD ou WASD)\nrotation fluide selon la direction\ncaméra third-person qui suit le robot\nLes pièces :\nspawn aléatoire dans la map\nanimation légère (rotation)\ndisparaissent lorsqu’elles sont collectées\naugmentent un score affiché à l’écran\nLes ours (ennemis) :\nmodèles low poly simples\nse déplacent de façon autonome (patrouille ou suivi du joueur si proche)\ncollision avec le joueur = game over\nInterface :\nscore affiché en haut à gauche\nécran de fin (Game Over)\nbouton pour recommencer\nGameplay :\nsystème de collision simple (robot / pièces / ours)\ngénération continue de pièces\ndifficulté progressive (ours plus rapides avec le temps)\nOptimisation :\ncode clair et structuré\ncommentaires dans le code\naucune dépendance complexe (Three.js CDN ok)\nBonus (si possible) :\nsons simples (collecte, game over)\neffet de particules lors de la collecte\nlégère animation du robot (marche)\n\nContraintes importantes :\n\nTout doit fonctionner directement après copier-coller dans un fichier .html\nPas de librairies lourdes hors Three.js\nPas de placeholders vides : fournir un jeu réellement fonctionnel\nPriorité à la jouabilité et à la fluidité plutôt qu’au réalisme extrême"
  },
  {
    "id": "nerdy-13-village-chinois",
    "title": "13. Village Chinois 3D",
    "subtitle": "Scène 3D dynasties Ming/Qing interactive",
    "category": "Nerdy Kings",
    "prompt": "Crée une scène immersive 3D d’un village chinois antique en style low poly ou semi-réaliste, entièrement en HTML, CSS et JavaScript (Three.js autorisé), dans un seul fichier si possible.\n\nLa scène doit être fluide, interactive, visuellement riche et directement exécutable dans un navigateur.\n\nObjectif :\nRecréer un village chinois ancien crédible (inspiré dynasties Ming/Qing) avec une ambiance immersive, cinématique et vivante.\n\nExigences visuelles :\n\nGénère un environnement 3D complet avec :\nmaisons traditionnelles chinoises (toits incurvés, lanternes rouges, bois sombre)\nrues pavées ou chemins en terre\nvégétation (bambous, arbres, petits jardins)\néléments culturels (arches, ponts, petits temples, étals de marché)\nAmbiance :\néclairage dynamique (coucher de soleil ou ambiance brumeuse)\nlégère brume/volumetric fog pour profondeur\nlanternes émettant une lumière chaude\nciel réaliste ou stylisé (HDRI ou gradient)\nAnimation :\nlanternes légèrement animées (balancement)\nparticules (poussière, lucioles ou pétales)\neau animée si rivière ou bassin présent\n\nInteraction utilisateur :\n\nCaméra libre contrôlable :\ndéplacement WASD / ZQSD\nsouris pour regarder autour (FPS ou orbit)\npossibilité de zoom\nExploration fluide du village :\ncollisions basiques avec les bâtiments\nzones accessibles (rues, ponts, places)\nOption bonus :\ninteraction avec objets (ex : lanternes qui s’allument, porte qui s’ouvre)\nPNJ simples qui marchent ou restent statiques\n\nInterface :\n\nécran clean sans UI intrusive\npetit texte discret indiquant les contrôles\n\nOptimisation & technique :\n\ncode clair et structuré avec commentaires\nThree.js via CDN uniquement\nperformances fluides (éviter surcharge géométrique)\ntous les assets générés procéduralement ou via code (pas de fichiers externes complexes)\n\nContraintes importantes :\n\ntout doit fonctionner en copiant-collant dans un fichier .html\npas de dépendances lourdes\nrendu visuellement impressionnant même avec low poly\néviter les scènes vides → le village doit sembler vivant et dense\n\nBonus avancé (fortement recommandé pour tester un modèle) :\n\ncycle jour/nuit dynamique\nson d’ambiance (vent, cloches, nature)\ncaméra cinématique automatique (mode “visite guidée” activable)\nvariation aléatoire du village à chaque reload"
  },
  {
    "id": "nerdy-14-simulateur-spaceship",
    "title": "14. Simulateur Spaceship 3D",
    "subtitle": "Vol orbital au-dessus de la Terre",
    "category": "Nerdy Kings",
    "prompt": "Crée un vrai simulateur de vaisseau spatial 3D low poly, entièrement en HTML, CSS et JavaScript, avec Three.js autorisé, et si possible dans un seul fichier. Je veux une expérience réellement jouable dans le navigateur, pas juste une démo visuelle. Le joueur doit piloter un vaisseau futuriste au-dessus de la Terre, avec une vraie sensation de vitesse, de fluidité et de liberté de mouvement. La planète doit être immense et impressionnante à l’écran, avec sa courbure bien visible, une atmosphère stylisée, des océans, des continents, quelques nuages et une belle lumière spatiale pour donner un rendu cinématique.\n\nLe vaisseau doit avoir un design low poly propre et lisible, avec des mouvements fluides, une légère inertie, une accélération progressive et une vraie sensation de contrôle. Quand il tourne, il doit s’incliner naturellement pour renforcer l’impression de pilotage. La caméra doit suivre le vaisseau en vue troisième personne de manière dynamique, avec un suivi fluide et un léger effet de recul quand la vitesse augmente. Si possible, ajoute aussi une vue cockpit ou first-person pour rendre l’expérience encore plus immersive.\n\nJe veux que le joueur puisse se déplacer librement autour de la Terre ou dans une zone orbitale, avec des éléments interactifs qui rendent le vol intéressant, comme des anneaux à traverser, des checkpoints, quelques satellites, des débris spatiaux ou des obstacles à éviter. Il doit y avoir un vrai objectif de gameplay, par exemple enchaîner des checkpoints, survivre sans collision ou faire le meilleur score possible. Il faut donc intégrer un système simple de collision, un score, un timer ou une distance parcourue, ainsi qu’un écran de début et un écran de fin avec possibilité de recommencer.\n\nVisuellement, l’ensemble doit être propre, moderne et immersif, avec un ciel spatial rempli d’étoiles, une belle gestion de la lumière, quelques effets de réacteurs ou de traînées lumineuses derrière le vaisseau, et si possible un léger mouvement ou une rotation de la Terre pour rendre la scène plus vivante. Le HUD doit rester discret mais afficher les informations utiles comme la vitesse, le score ou l’état de la partie.\n\nLe code doit être clair, structuré, commenté et directement fonctionnel après un simple copier-coller dans un fichier HTML. N’utilise pas de dépendances lourdes ni d’assets complexes. Priorité absolue à la jouabilité, à la fluidité et à la sensation de pilotage. Je veux un vrai mini jeu spatial jouable et visuellement stylé, pas un prototype vide."
  },
  {
    "id": "nerdy-15-nerdypocket",
    "title": "15. NerdyPocket Console",
    "subtitle": "Site web console portable rétro-futuriste",
    "category": "Nerdy Kings",
    "prompt": "J’ai besoin d’un magnifique site web pour NerdyPocket, une console portable rétro-futuriste haut de gamme. Le site doit commencer par une section hero premium, avec une animation qui tourne autour d’une console portable posée sur un bureau sombre, entourée de cartouches, de câbles et d’une lumière néon subtile. Toute la scène doit être créée par toi, car je n’ai aucun asset pour le produit. La console, l’écran, les boutons, les sticks, les ports, les reflets, les traces d’usure légère et l’environnement doivent être générés programmatiquement. Après cette section hero, ajoute une section “À propos”, puis une sélection des modèles disponibles. Il y a deux versions prévues pour la collection été 2026. Tous les assets doivent être créés en code et avoir un rendu très haut de gamme, comme des rendus Keyshot professionnels"
  }
];

export const CLASSIC_TEST_PROMPTS: PromptPreset[] = [
  {
    "id": "car-wash",
    "title": "Car Wash Test",
    "subtitle": "Should you walk or drive?",
    "category": "Classic Benchmarks",
    "prompt": "If you are going to a car wash, should you walk or drive?"
  },
  {
    "id": "9-9-vs-9-11",
    "title": "9.9 vs 9.11",
    "subtitle": "Which one is larger?",
    "category": "Classic Benchmarks",
    "prompt": "Which one is larger: 9.9 or 9.11? Explain your reasoning."
  },
  {
    "id": "strawberry",
    "title": "Strawberry Test",
    "subtitle": "How many r’s are in the word",
    "category": "Classic Benchmarks",
    "prompt": "How many 'r's are in the word 'strawberry'?"
  },
  {
    "id": "poem-riddle",
    "title": "Poem Riddle",
    "subtitle": "Compose a 12-line poem",
    "category": "Classic Benchmarks",
    "prompt": "Compose a 12-line poem about an elusive time traveler."
  },
  {
    "id": "personal-finance",
    "title": "Personal Finance",
    "subtitle": "Draft up a portfolio management proposal",
    "category": "Classic Benchmarks",
    "prompt": "Draft up a portfolio management proposal for a moderately risk-tolerant client with a 15-year horizon."
  },
  {
    "id": "anagram-challenge",
    "title": "Anagram Challenge",
    "subtitle": "Unscramble letters to form a word.",
    "category": "Classic Benchmarks",
    "prompt": "Unscramble the letters 'L-I-S-T-E-N' to form all valid English words."
  },
  {
    "id": "missing-dollar",
    "title": "The Missing Dollar",
    "subtitle": "A classic logic puzzle involving money.",
    "category": "Classic Benchmarks",
    "prompt": "Three guests check into a hotel room that costs $30 ($10 each). The manager realizes the room was only $25 and gives $5 to the bellboy to return. The bellboy pockets $2 and gives each guest $1 back. Now each guest paid $9 (total $27) and the bellboy has $2 (total $29). Where is the missing dollar?"
  },
  {
    "id": "word-transformation",
    "title": "Word Transformation",
    "subtitle": "Change one word into another by altering one letter at a time.",
    "category": "Classic Benchmarks",
    "prompt": "Change one word into another by altering one letter at a time: transform 'COLD' into 'WARM', where every intermediate step is a valid word."
  },
  {
    "id": "palindrome-quest",
    "title": "Palindrome Quest",
    "subtitle": "Find the smallest palindrome greater than a given number.",
    "category": "Classic Benchmarks",
    "prompt": "Find the smallest palindrome greater than 88988. Explain the mathematical step-by-step logic."
  },
  {
    "id": "alphabet-series",
    "title": "Alphabet Series",
    "subtitle": "Identify the next letter in a sequence.",
    "category": "Classic Benchmarks",
    "prompt": "Identify the next letter in the sequence: A, C, F, J, O, ... Explain the rule and pattern."
  },
  {
    "id": "career-development",
    "title": "Career Development",
    "subtitle": "Create a professional growth roadmap.",
    "category": "Classic Benchmarks",
    "prompt": "Create a 3-year professional growth roadmap for an engineer transitioning into technical leadership."
  },
  {
    "id": "healthy-lifestyle",
    "title": "Healthy Lifestyle",
    "subtitle": "Design a balanced diet and exercise regimen.",
    "category": "Classic Benchmarks",
    "prompt": "Design a balanced diet and exercise regimen for a desk worker aiming to improve posture, energy, and cardiovascular fitness."
  },
  {
    "id": "small-business-strategy",
    "title": "Small Business Strategy",
    "subtitle": "Develop a business expansion plan.",
    "category": "Classic Benchmarks",
    "prompt": "Develop a 12-month business expansion plan for a local artisan coffee roastery expanding into direct-to-consumer e-commerce."
  },
  {
    "id": "educational-advancement",
    "title": "Educational Advancement",
    "subtitle": "Plan for higher education.",
    "category": "Classic Benchmarks",
    "prompt": "Plan for higher education: create a structured roadmap for an undergraduate preparing to apply for competitive master’s programs in Artificial Intelligence."
  }
];

export const COMMON_TEST_PROMPTS: PromptPreset[] = [
  ...NERDY_KINGS_PROMPTS,
  ...CLASSIC_TEST_PROMPTS
];
