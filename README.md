# Automata tool

Tool to play around with automata concepts, with support for new working  enviroments

## Getting Started

- Clone the projet
- navigate to gui/public and open index.html
- to get started with extending the tool type ```npm i``` to install dev dependencies in the root dir run : 
-- npm run watch to start typescript compiler
-- npm run serve to start dev server when working on UI ( made with love with Vue.js )
-- npm run build to generate a production build

[live demo here](https://ivanange.github.io/automata/)

**Note** : tool uses a worker to isolate computation from UI, with a little  API built on top of worker messages for communication with UI.
