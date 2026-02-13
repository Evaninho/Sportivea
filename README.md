🏅 Sportivea - Plateforme d’Événements Sportifs


Description du projet :

Sportivea est une application web collaborative conçue pour rassembler les passionnés de sport. Elle permet aux utilisateurs de découvrir des événements sportifs organisés à proximité, de consulter les détails de chaque activité et de voter pour celles qui les intéressent le plus. La plateforme offre également la possibilité aux membres connectés de créer leurs propres événements, favorisant ainsi l'interaction et l'organisation communautaire autour du sport.

Architecture Technique:

L'application repose sur un environnement Node.js utilisant le framework Express pour la gestion du serveur et de l'API REST. Le style visuel est assuré par TailwindCSS, garantissant une interface moderne et totalement responsive. Pour la gestion des données, le projet utilise des fichiers JSON locaux (events.json et users.json), ce qui permet une installation rapide sans avoir besoin de configurer une base de données complexe tout en conservant les informations après chaque redémarrage.

Instructions d'installation:

Pour installer le projet, commencez par télécharger l'archive et extrayez-en le contenu dans le dossier de votre choix. Ouvrez ensuite un terminal dans ce dossier et exécutez la commande npm install pour télécharger toutes les dépendances nécessaires, telles qu'Express et Cors. Une fois l'installation terminée, vous pouvez lancer le serveur en utilisant la commande npm start ou node src/server.js. L'application sera alors accessible sur votre navigateur à l'adresse http://localhost:3000.

Vous pourrez également consulter directement notre projet, qui est hébergé à l’adresse suivante : https://sportivea.alwaysdata.net

Fonctionnalités principales:

Une fois sur la page d'accueil, vous pouvez parcourir la liste des événements sous forme de cartes élégantes. Vous disposez d'une barre de recherche et d'un filtre par catégorie pour trouver rapidement le sport qui vous convient (Football, Running, Tennis, etc.). En cliquant sur "Détails", une fenêtre s'ouvre pour afficher les informations complètes. Pour voter ou ajouter un nouvel événement via le bouton dédié, vous devrez d'abord vous connecter ou créer un compte en quelques secondes via le menu de navigation.

Répartition des tâches:

Le projet a été réalisé en binôme avec une séparation claire des responsabilités pour respecter le délai de deux jours. Un membre s'est concentré sur la partie "Backend" (création du serveur, des routes API et de la logique de stockage JSON), tandis que l'autre a pris en charge la partie "Frontend" (structure HTML, design TailwindCSS et intégration des appels API avec Fetch). Les phases de débogage et de mise en place du responsive design ont été réalisées en collaboration directe.


Lien pour accéder a la video de présentation :
https://filesender.renater.fr/?s=download&token=476ff0a2-89b9-4765-ae33-c4dcc6ce8705
