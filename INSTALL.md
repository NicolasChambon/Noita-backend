Pour initier une API REST en utilisant Node.js avec Express, Sequelize, PostgreSQL, ESLint, et Prettier, vous pouvez suivre ces étapes :

### Étape 1 : Créer un nouveau projet Node.js

1. **Initialiser un projet Node.js**

   ```bash
   mkdir mon-api
   cd mon-api
   npm init -y
   ```

   Cela crée un fichier `package.json` avec les paramètres par défaut.

### Étape 2 : Installer les dépendances

2. **Installer Express, Sequelize, et PostgreSQL**

   ```bash
   npm install express sequelize pg pg-hstore
   ```

   - `express` : Framework web pour Node.js.
   - `sequelize` : ORM (Object-Relational Mapping) pour Node.js.
   - `pg` et `pg-hstore` : Pilote PostgreSQL et gestion des types de données PostgreSQL.

3. **Installer les outils de développement**

   ```bash
   npm install --save-dev nodemon eslint prettier eslint-config-prettier eslint-plugin-prettier sequelize-cli
   ```

   - `nodemon` : Redémarre automatiquement le serveur lorsque des changements sont détectés.
   - `eslint` : Linting tool pour le code JavaScript.
   - `prettier` : Outil de formatage de code.
   - `eslint-config-prettier` : Désactive les règles ESLint qui sont en conflit avec Prettier.
   - `eslint-plugin-prettier` : Exécute Prettier comme une règle ESLint.
   - `sequelize-cli` : Outils CLI pour Sequelize, utile pour les migrations et les modèles.

### Étape 3 : Configurer ESLint et Prettier

4. **Configurer ESLint**

   ```bash
   npx eslint --init
   ```

   Suivez les instructions pour configurer ESLint. Vous pouvez choisir un style de code, définir l'environnement (Node.js), et l'intégration avec Prettier.

   Exemple de fichier `.eslintrc.json` (s'il n'existe pas créez-le) :

   ```json
   {
     "env": {
       "node": true,
       "commonjs": true,
       "es2021": true,
       "sourceType": "module"
     },
     "extends": ["eslint:recommended", "plugin:prettier/recommended"],
     "parserOptions": {
       "ecmaVersion": 12
     },
     "rules": {}
   }
   ```

5. **Configurer Prettier**
   Créez un fichier `.prettierrc` à la racine du projet :
   ```json
   {
     "semi": true,
     "singleQuote": true,
     "trailingComma": "es5"
   }
   ```

### Étape 4 : Initialiser Sequelize

6. **Initialiser Sequelize**

   ```bash
   npx sequelize-cli init
   ```

   Cela crée les répertoires suivants :

   - `config` : Contient le fichier de configuration de la base de données.
   - `models` : Contient les modèles Sequelize.
   - `migrations` : Contient les fichiers de migration.
   - `seeders` : Contient les fichiers de seeding.

7. **Créer le rôle dans PostgreSQL :**
   Tu peux créer un nouveau rôle dans PostgreSQL avec le nom "marion" en utilisant la commande suivante dans ton terminal ou ton client PostgreSQL :

   ```bash
   sudo -u postgres psql
   CREATE ROLE marion WITH LOGIN PASSWORD 'ton_mot_de_passe';
   ALTER ROLE marion CREATEDB;
   ```

   Assure-toi de remplacer `'ton_mot_de_passe'` par un mot de passe sécurisé.

8. **Configurer la base de données**
   Modifiez le fichier `config/config.json` pour y ajouter vos paramètres PostgreSQL :

   ```json
   {
     "development": {
       "username": "votre_utilisateur",
       "password": "votre_mot_de_passe",
       "database": "nom_de_la_base",
       "host": "127.0.0.1",
       "dialect": "postgres"
     },
     "test": {
       "username": "votre_utilisateur",
       "password": "votre_mot_de_passe",
       "database": "nom_de_la_base_test",
       "host": "127.0.0.1",
       "dialect": "postgres"
     },
     "production": {
       "username": "votre_utilisateur",
       "password": "votre_mot_de_passe",
       "database": "nom_de_la_base_production",
       "host": "127.0.0.1",
       "dialect": "postgres"
     }
   }
   ```

9. **Créer la base de données**
   ```bash
   npx sequelize-cli db:create
   ```

### Étape 5 : Créer l'API

9. **Créer un serveur Express de base**

   Créez un fichier `src/index.js` avec le code suivant :

   ```javascript
   const express = require('express');
   const app = express();
   const PORT = process.env.PORT || 3000;

   app.use(express.json());

   app.get('/', (req, res) => {
     res.send('Hello World!');
   });

   app.listen(PORT, () => {
     console.log(`Server is running on port ${PORT}`);
   });
   ```

   Modifiez votre `package.json` pour ajouter un script de démarrage avec `nodemon` :

   ```json
   "scripts": {
     "start": "nodemon src/index.js"
   }
   ```

   Ensuite, lancez le serveur :

   ```bash
   npm start
   ```

### Étape 6 : Ajouter les routes, les modèles et les contrôleurs

10. **Ajouter un modèle Sequelize**

    Exemple : Créer un modèle `User` :

    ```bash
    npx sequelize-cli model:generate --name User --attributes firstName:string,lastName:string,email:string
    ```

    Cela crée un fichier de modèle dans `models/user.js` et une migration correspondante dans `migrations/`.

11. **Appliquer les migrations**

    ```bash
    npx sequelize-cli db:migrate
    ```

12. **Ajouter des routes et des contrôleurs**
    Créez des routes et des contrôleurs dans des dossiers séparés (`src/routes`, `src/controllers`) pour organiser votre code.

    Exemple simple pour ajouter une route utilisateur dans `src/routes/user.js` :

    ```javascript
    const express = require('express');
    const router = express.Router();
    const { User } = require('../models');

    router.get('/users', async (req, res) => {
      const users = await User.findAll();
      res.json(users);
    });

    module.exports = router;
    ```

    Ensuite, intégrez la route dans votre `index.js` :

    ```javascript
    const userRoutes = require('./routes/user');
    app.use('/api', userRoutes);
    ```

### Étape 7 : Configurer ESLint et Prettier pour un usage continu

13. **Automatiser ESLint et Prettier**
    Ajoutez des scripts dans `package.json` pour exécuter ESLint et Prettier :

    ```json
    "scripts": {
      "lint": "eslint 'src/**/*.{js,jsx}'",
      "format": "prettier --write 'src/**/*.{js,jsx,json}'"
    }
    ```

    Vous pouvez maintenant exécuter `npm run lint` pour vérifier le code, et `npm run format` pour formater le code avec Prettier.

### Conclusion

Vous avez maintenant une API REST de base configurée avec Node.js, Express, Sequelize, PostgreSQL, ESLint et Prettier. Vous pouvez ajouter des modèles, des routes et des contrôleurs pour étendre les fonctionnalités de votre API.
