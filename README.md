# nest-doc-dgeni-poc

This repo is a proof of concept of generating the NestJS docs using
dgeni.


# Getting started

```sh

cd workspace
mkdir dgeni-nest-playground && cd dgeni-nest-playground
git clone https://github.com/BrunnerLivio/nest.git
cd nest
git checkout fix/jsdoc-comments
cd ..
git clone https://github.com/BrunnerLivio/nest-doc-dgeni-poc.git
cd nest-doc-dgeni-poc
npm i
npm run start
# See the result
tree generated

```