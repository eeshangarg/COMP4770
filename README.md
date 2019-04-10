[![Build Status](https://travis-ci.com/eeshangarg/COMP4770.svg?token=QShBcTiKKJroZPan48rz&branch=master)](https://travis-ci.com/eeshangarg/COMP4770)

# COMP-4770 - The Knight Before

[![The Knight Before Trailer](https://img.youtube.com/vi/fNjz7TfDcRA/0.jpg)](https://www.youtube.com/watch?v=fNjz7TfDcRA)

## Installation

1. Make sure you have Node (and `npm`), MongoDB and Git installed:
    * [Node installation instructions](https://nodejs.org/en/download/package-manager/).
      We used [these instructions](https://github.com/nodesource/distributions/blob/master/README.md#debian-and-ubuntu-based-distributions)
      for Ubuntu.
    * [MongoDB installation instructions](https://docs.mongodb.com/manual/installation/).
      We used [these instructions](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)
      for Ubuntu.
    * [Git installation instructions](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git).
      We used [these instructions](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git#_installing_on_linux)
      for Ubuntu.

1. Clone the repo:

    `git clone https://github.com/eeshangarg/COMP4770`

1. Type: `cd COMP4770/`.

1. Install all `npm` dependencies by running:

    `npm install .`

    **Note** that you if you already had `npm` installed, you might have
    to run `npm install -g npm` to upgrade to the latest `npm` version.

1. You can start the game server by running:

    `npm run server`

    Navigate to localhost:2000 to play the game.

## Running tests

1. You can run Flow, ESLint and all unit tests by running:

    `./tools/test-all`

