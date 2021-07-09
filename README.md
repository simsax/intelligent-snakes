# Intelligent snakes

![snake-gif](C:\Users\Sax\Desktop\robe\Progetti\snake\intelligent-snakes\img\snake.gif)



## Introduction

This is a project I did some months ago but never published. The goal is to train an AI model that is able to play the game *Snake*. In order to do so, I used an algorithm called *NEAT*, which stands for *Neuroevolution of augmenting topologies*. In short, each snake has a brain, which is a neural network. Instead of training the networks in the standard way, we use a genetic algorithm to find the NNs that happen to perform better than the others, and those are going to have a higher probability of being selected as parents for the next generation of snakes. In my case I implemented both crossover and a copy-mutate approach. The second option seems to work better.

I decided to do the project in JavaScript because when I started it I was learning this language in one of my university courses, so I wanted to challenge myself. Also, using p5.js made my life a bit easier.

## Usage

Open index.html in your browser

## Credits

Some parts of the code are inspired by https://github.com/Code-Bullet/SnakeFusion

