function createModel(layers) {
	const model = tf.sequential();
	for (let i = 1; i < layers.length; i++) {
		if (i == 1) { // first hidden layer
			model.add(tf.layers.dense({
				units: layers[i],
				inputShape: [layers[0]],
				activation: 'sigmoid'
			}));
		} else if (i == layers.length - 1) { // output layer
			model.add(tf.layers.dense({
				units: layers[i],
				activation: 'softmax'
			}));
		} else { // the other hidden layers
			model.add(tf.layers.dense({
				units: layers[i],
				activation: 'sigmoid'
			}));
		}
	}
	return model;
}

function NeuralNetwork(a, b) {
	if (a instanceof tf.Sequential) {
		this.model = a;
		this.layers = b;
	} else {
		this.layers = a;
		this.model = createModel(this.layers);
	}

	this.predict = (inputs) => { // feed forward
		return tf.tidy(() => {
			const xs = tf.tensor2d([inputs]);
			const ys = this.model.predict(xs);
			const outputs = ys.dataSync(); // obtain output array from tensor
			return outputs;
		})
	}

	this.copy = () => {
		return tf.tidy(() => {
			const modelCopy = createModel(this.layers);
			const weights = this.model.getWeights();
			const weightCopies = [];
			weights.forEach((weight, index) => {
				weightCopies[index] = weight.clone();
			}); 
			modelCopy.setWeights(weightCopies);
			return new NeuralNetwork(modelCopy, this.layers);
		});
	}

	this.crossover = (partner) => {
		return tf.tidy(() => {
			const weights = this.model.getWeights();
			const partnerWeights = partner.model.getWeights();
			const childWeights = [];
			weights.forEach((weight, index) => {
				let shape = weight.shape;
				let values = weight.dataSync().slice(); // all values of weights and biases flattened
				let partnerValues = partnerWeights[index].dataSync().slice();
				let childValues = [];
				let cut = floor(random(values.length));
				for (let i = 0; i < values.length; i++) {
					if (i < cut)
						childValues[i] = values[i];
					else
						childValues[i] = partnerValues[i];
				}
				let newTensor = tf.tensor(childValues, shape);
				childWeights[index] = newTensor;
			});
			const child = createModel(this.layers);
			child.setWeights(childWeights);
			return new NeuralNetwork(child, this.layers);
		});
	}

	this.mutate = (rate) => {
		tf.tidy(() => {
			const weights = this.model.getWeights();
			const mutatedWeights = [];
			weights.forEach((weight, index) => {
				let shape = weight.shape;
				let values = weight.dataSync().slice(); // all values of weights and biases flattened
				for (let i = 0; i < values.length; i++) {
					if (random(1) < rate) {// mutate rate% of the weights
						values[i] += randomGaussian();
					}
				}
				let newTensor = tf.tensor(values, shape);
				mutatedWeights[index] = newTensor;
			});
			this.model.setWeights(mutatedWeights);
		});
	}

	this.dispose = () => {
		this.model.dispose();
	}

	this.save = async (name) => {
		await this.model.save(`localstorage://${name}`);
	}

}