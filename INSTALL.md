Pour initier une API REST en utilisant Node.js avec Express, Sequelize, PostgreSQL, ESLint, et Prettier, vous pouvez suivre ces étapes :

### Étape 1 : Créer un nouveau projet Node.js

1. **Initialiser un projet Node.js**

   ```bash
   mkdir Noita-backend
   cd Noita-backend
   npm init -y
   ```

   Cela crée un fichier `package.json` avec les paramètres par défaut.

### Étape 2 : Installer les dépendances

2. **Installer Express, Sequelize, et PostgreSQL**

   ```bash
   npm install express sequelize pg dotenv
   ```

   - `express` : Framework web pour Node.js.
   - `sequelize` : ORM (Object-Relational Mapping) pour Node.js.
   - `pg` : Pilote PostgreSQL

3. **Installer les outils de développement**

   ```bash
   npm install --save-dev eslint prettier eslint-config-prettier eslint-plugin-prettier @eslint/js
   ```

### Étape 3 : Configurer ESLint et Prettier

4. **Configurer ESLint**

   créer le fichier eslint.config.js à la racine

   ```javascript
   import js from '@eslint/js';
   import pluginPrettier from 'eslint-plugin-prettier';
   import prettierConfig from 'eslint-config-prettier';
   import globals from 'globals';

   export default [
     js.configs.recommended,
     {
       files: ['**/*.js'],
       ignores: ['node_modules/**'],
       languageOptions: {
         ecmaVersion: 'latest', // Support des dernières fonctionnalités ECMAScript
         sourceType: 'module', // Utilisation des modules (import/export)
         globals: {
           ...globals.node,
         },
       },
       rules: {
         'no-console': 'warn',
         'no-unused-vars': ['error', { argsIgnorePattern: '^_' }], // Ignore les variables non utilisées commençant par "\_"
       },
     },
     {
       plugins: {
         prettier: pluginPrettier,
       },
       rules: {
         'prettier/prettier': 'error', // Lever une erreur en cas de non-respect des règles Prettier
       },
     },
     {
       // Prettier rules to avoid conflicts
       rules: prettierConfig.rules,
     },
   ];
   ```

5. **Configurer Prettier**

Créez un fichier `.prettierrc` à la racine du projet :

```json
{
  "singleQuote": true,
  "trailingComma": "es5",
  "semi": true,
  "tabWidth": 2,
  "printWidth": 80
}
```

6. **Ajout de scripts npm**

Ajoutez des scripts dans votre package.json pour lancer ESLint et Prettier facilement et passage en mode module :

```json
{
  "scripts": {
    "lint": "eslint .",
    "format": "prettier --write ."
  },
  "type": "module"
}
```

### Étape 4 : Base de donnée

7. **Créez la base de donnée**

   Créez le fichier suivant : data/initdb/create_database.sql

   ```sql
   CREATE USER marion WITH PASSWORD 'C501553p!1';
   CREATE DATABASE noita OWNER marion;
   ```

   Open a terminal and run the following command from the root of the project

   7.1. sudo -i -u postgres

   "-i" flag is used to login as the postgres user
   "-u" flag is used to specify the user to login as

   7.2. psql -f /var/www/html/Noita/Noita-backend/data/create_database.sql

   "-f" flag is used to specify the file to run

8. **Code SQL de la BDD**

   Rédiger le code SQL de création des tables un fichier data/initdb/01_create_tables.sql puis le code de seeding (si besoin) dans un fichier data/initdb/02_seeding.sql.

   Tapez dans une terminal :

   psql -U marion -d noita < /var/www/html/Noita/Noita-backend/data/initdb/01_create_tables.sql
   "-U" flag is used to specify the user to run the command as
   "-d" flag is used to specify the database to run the command on
   "<" is used to specify the file to run

   puis:

   psql -U marion -d noita < /var/www/html/Noita/Noita-backend/data/initdb/02_seeding.sql

### Étape 5 : Mise en place de Sequelize

9. **Création du fichier de connection à la BDD**

   src/config/database.js

   ```javascript
   import { Sequelize } from 'sequelize';
   import dotenv from 'dotenv/config';

   // Database connection we want to use underscored naming strategy
   const sequelize = new Sequelize(process.env.PG_URL, {
     define: {
       underscored: true,
     },
   });

   export default sequelize;
   ```

   stocker PG_URL dans le .env sous la forme

   ```
   PG_URL=postgres://<YourUserName>:<YourPassword>@localhost:5432/<YourDatabaseName>
   ```

### Étape 6 : Mise en place du serveur

10. **Création du fichier serveur**

    créez le fichier suivant src/index.js

    ```javascript
    import express from 'express';
    import dotenv from 'dotenv/config';

    import sequelize from './config/database.js';

    import router from './routers/indexRouter.js';

    const app = express();

    const PORT = process.env.PORT || 3000;

    // Establish database connection
    // ()() syntax is used to call the asynchronous function directly after defining it
    (async () => {
      try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
      } catch (error) {
        console.error('Unable to connect to the database:', error);
        throw new Error('Unable to connect to the database');
      }
    })();

    app.use(router);

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).send('Internal Server Error');
    });

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
    ```

11. **Création du fichier router principal**

    créez le fichier suivant src/routers/indexRouter.js

    ```javascript
    import express from 'express';

    // import carousePictureRouter from './carouselPictureRouter.js';
    // import concertRouter from './concertRouter.js';
    // import postRouter from './postRouter.js';

    import mainController from '../controllers/mainControllers.js';

    const router = express.Router();

    // router.use('/api/carousel-pictures', carousePictureRouter);
    // router.use('/api/concerts', concertRouter);
    // router.use('/api/posts', postRouter);

    router.get('/', mainController.index);

    export default router;
    ```

12. **Création du fichier mainController**

    créez le fichier suivant src/controllers/mainController.js

    ```javascript
    const mainController = {
      index: (req, res) => {
        res.send('<h1>Welcome to Noïta API</h1>');
      },
    };

    export default mainController;
    ```

13. **Adapter le fichier package.json**

    ajouter les scripts dev et start dans package.json et donner la source main /src/index.js

    ```json
    "main": "src/index.js",
    "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "nodemon src/index.js",
    "start": "node src/index.js"
    },
    ```

14. **Lancez le script npm run dev**
