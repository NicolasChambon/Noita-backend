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
   npm install express sequelize pg dotenv
   ```

   - `express` : Framework web pour Node.js.
   - `sequelize` : ORM (Object-Relational Mapping) pour Node.js.
   - `pg` : Pilote PostgreSQL

3. **Installer les outils de développement**

   ```bash
   npm install --save-dev nodemon eslint prettier eslint-config-prettier eslint-plugin-prettier
   ```

   - `nodemon` : Redémarre automatiquement le serveur lorsque des changements sont détectés.
   - `eslint` : Linting tool pour le code JavaScript.
   - `prettier` : Outil de formatage de code.
   - `eslint-config-prettier` : Désactive les règles ESLint qui sont en conflit avec Prettier.
   - `eslint-plugin-prettier` : Exécute Prettier comme une règle ESLint.

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
       "ecmaVersion": "latest"
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

6. **.ignore**
   Créez un fichier `.prettierignore` et un fichier `.eslintignore` à la racine du proejt :
   ```
   node_modules
   dist
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

   7.2. psql -f data/create_database.sql

   "-f" flag is used to specify the file to run

8. **Code SQL de la BDD**

   Rédiger le code SQL de création des tables un fichier data/initdb/01_create_tables.sql puis le code de seeding (si besoin) dans un fichier data/initdb/02_seeding.sql.

   Tapez dans une terminal :

   psql -U marion -d noita < data/create_tables.sql
   "-U" flag is used to specify the user to run the command as
   "-d" flag is used to specify the database to run the command on
   "<" is used to specify the file to run

   puis:

   psql -U marion -d noita < data/seeding.sql
