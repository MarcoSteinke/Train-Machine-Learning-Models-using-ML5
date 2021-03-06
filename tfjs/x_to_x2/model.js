// Build and compile model.
const model = tf.sequential();
const EPOCHS = 3000;
model.add(tf.layers.dense({units: 4, inputShape: [1]}));
//model.add(tf.layers.dense({units: 1, activation: 'sigmoid'}))
model.compile({optimizer: 'adam', loss: 'meanSquaredError', metrics: ['accuracy']});

// Prepare f(x) = x²
let xsquare = x => x**2;
let noise = x => x*(0.75 + Math.random()/2);
let xInput = [], yInput = [], yNoisyInput = [];

for(let i = 0; i < 100; i += 1) {
    xInput.push([i]);
    yInput.push([xsquare(i)]);
    yNoisyInput.push([noise(xsquare(i))]);
}

const xDataset = tf.data.array(xInput);
const yDataset = tf.data.array(yInput);

const input = tf.data.zip(
    {
        xs: xDataset,
        ys: yDataset
    }
)
.batch(1)
.shuffle(50);

function toDottedNumber(number) {
    let chars = [];
    let j = 0;
    for(let i in ("" + number)) {
      j++;
      if(j % 3 == 1) chars.push(".");
      chars.push(("" + number)[("" + number).length - i - 1]);
    }
    
    return chars.slice(1,chars.length).reverse().join('');
}

async function train(model, input) {

    await model.fitDataset(
        input,
        {
            batchSize: 32,
            epochs: EPOCHS,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    document.querySelector("#log").innerHTML += (`Epoch: ${epoch} / ${EPOCHS}, Loss:${(logs.loss.toFixed(4) > 100) ? toDottedNumber(logs.loss) : logs.loss.toFixed(4)}\n`);
                    document.querySelector("#log").scrollTo(0,10e4);
                    document.querySelector("#log").style.display = "block";
                },
                onTrainEnd: (logs) => {
                    document.querySelector("#afterTraining").innerHTML = `Training finished. Scroll down to see the performance!`;
                    document.querySelector("#result").style.display = "block";
                }
            }
        },
        
    );
}

async function runModel(model, input) {

    startTime = Date.now();

    await train(model, input);

    endTime = Date.now();

    // Check model for correct results:

    model.summary();

    predictInput(model);
}

function calculateTimeInSeconds() {
return Math.abs((endTime - startTime) / 1000);
}