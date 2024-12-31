document.getElementById("eq").addEventListener('click', function () {
  document.getElementById("second2").style.display = "none";
  document.getElementById("first").style.display = "block";
});
document.getElementById("min").addEventListener('click', function () {
  document.getElementById("first").style.display = "none";
  document.getElementById("second2").style.display = "grid";
});

// Function to dynamically generate transition function table
function generateTransitionTable(statesInput, alphabetInput, tableId) {
  const states = statesInput.split(',').map(state => state.trim());
  const alphabet = alphabetInput.split(',').map(symbol => symbol.trim());
  const table = document.getElementById(tableId);

  // Clear previous rows and column headers
  table.getElementsByTagName('thead')[0].innerHTML = '';
  table.getElementsByTagName('tbody')[0].innerHTML = '';

  // Populate table with dynamic rows and columns
  const headerRow = table.getElementsByTagName('thead')[0].insertRow();
  headerRow.insertCell(0).innerHTML = 'State';

  alphabet.forEach(symbol => {
    const cell = headerRow.insertCell();
    cell.innerHTML = `${symbol}`;
  });

  states.forEach(state => {
    const row = table.getElementsByTagName('tbody')[0].insertRow();
    const cell1 = row.insertCell(0);
    cell1.innerHTML = state;

    alphabet.forEach((symbol, index) => {
      const cell = row.insertCell(index + 1);
      const select = document.createElement('select');
      // Add options with state values
      states.forEach((stateValue) => {
        const option = document.createElement('option');
        option.value = stateValue;
        option.text = stateValue;
        select.add(option);
      });
      cell.appendChild(select);
    });
  });
}

// Call the function when states or alphabet input changes
document.getElementById('states1').addEventListener('input', function () {
  generateTransitionTable(this.value, document.getElementById('alphabet1').value, 'transitionTable1');
});

document.getElementById('alphabet1').addEventListener('input', function () {
  generateTransitionTable(document.getElementById('states1').value, this.value, 'transitionTable1');
});

document.getElementById('states2').addEventListener('input', function () {
  generateTransitionTable(this.value, document.getElementById('alphabet2').value, 'transitionTable2');
});

document.getElementById('alphabet2').addEventListener('input', function () {
  generateTransitionTable(document.getElementById('states2').value, this.value, 'transitionTable2');
});

document.getElementById('states3').addEventListener('input', function () {
  generateTransitionTable(this.value, document.getElementById('alphabet3').value, 'transitionTable3');
});

document.getElementById('alphabet3').addEventListener('input', function () {
  generateTransitionTable(document.getElementById('states3').value, this.value, 'transitionTable3');
});
function generateDFA() {
  
  // Parse user input and generate the DFA
  const statesInput = document.getElementById('states3').value.split(',');
  const startStateInput = document.getElementById('initialState3').value;
  const finalStatesInput = document.getElementById('acceptingStates3').value.split(',');
  const alphabetsInput = document.getElementById('alphabet3').value.split(',');

  // Create DFA transition table based on user input
  let dfaTransition = {};
  const transitionTable = document.getElementById('transitionTable3');
  const rows = transitionTable.getElementsByTagName('tbody')[0].getElementsByTagName('tr');

  for (let i = 0; i < rows.length; i++) {
    const state = rows[i].cells[0].innerText.trim();
    dfaTransition[state] = {};

    for (let j = 1; j < rows[i].cells.length; j++) {
      const symbol = transitionTable.rows[0].cells[j].innerText.trim();
      const endState = rows[i].cells[j].getElementsByTagName('select')[0].value;
      dfaTransition[state][symbol] = endState;
    }
  }

  // Create DFA object
  let dfa = new DFA(dfaTransition, finalStatesInput, startStateInput);



  // Display the DFA and its minimizations
  let dfaOutput = '<div style="display: flex;">';

  // Display the original DFA
  dfaOutput += '<div style="flex: 1;">';
  dfaOutput += '<h1>Original DFA</h1>' + Viz(dfa2GraphViz(dfa));
  dfaOutput += '</div>';

  const dfa_min_names = dfa.minimize('names');

  // Display the minimized DFA
  dfaOutput += '<div style="flex: 1; text-align:center; ">';
  dfaOutput += '<h1>Minimized DFA</h1>' + Viz(dfa2GraphViz(dfa_min_names));
  dfaOutput += '</div>';

  dfaOutput += '</div>';

  dfaOutput += '<div style="text-align: center;">';
  dfaOutput += dfa2Text(dfa_min_names);
  dfaOutput += '</div>';
  document.getElementById('output').innerHTML = dfaOutput;

}

function logTransitionFunction() {
  // Assuming the transition table is already created and present in the DOM
  const transitionTable = document.getElementById('transitiontable');

  if (!transitionTable) {
    console.error('Transition table not found.');
    return;
  }

  const transitionFunction = {};

  // Iterate through the rows of the table
  for (let i = 1; i < transitionTable.rows.length; i++) {
    const state = transitionTable.rows[i].cells[0].textContent.trim();
    transitionFunction[state] = {};

    // Iterate through the cells of each row, starting from the second cell
    for (let j = 1; j < transitionTable.rows[i].cells.length; j++) {
      const symbol = transitionTable.rows[0].cells[j].textContent.trim();
      const nextState = transitionTable.rows[i].cells[j].textContent.trim();
      transitionFunction[state][symbol] = nextState;
    }
  }

  // Return the transition function in the desired format
  let txt = "{";
  for (const state in transitionFunction) {
    txt += "'" + state + "' { ";
    let prefix = "";
    for (const symbol in transitionFunction[state]) {
      txt += prefix + "'" + symbol + "' : '" + transitionFunction[state][symbol] + "'";
      prefix = " , ";
    }
    txt += " },";
  }
  txt += "};";

  const startState = transitionTable.rows[1].cells[0].textContent.trim();
  txt += `startState = '${startState}';`;

  const finalStates = Array.from(document.querySelector('#output ul').children).map(li => li.textContent.trim());
  txt += "final = [ ";
  let prefix = "";
  for (let i = 0; i < finalStates.length; i++) {
    txt += prefix + "'" + finalStates[i] + "'";
    prefix = " , ";
  }

  return txt + " ];";
}

function generateinput() {
  const res = logTransitionFunction();

  const transitionRegex = /'([^']+)' \{ '([^']+)' : '([^']+)' , '([^']+)' : '([^']+)' \},/g;
  const startStateRegex = /startState = '([^']+)'/;
  const finalStatesRegex = /final = \[([\s\S]+?)\ \];/;

  let transitionFunction = {};
  let match;

  // Extract transition function
  while ((match = transitionRegex.exec(res)) !== null) {
    const [, state, symbol0, nextState0, symbol1, nextState1] = match;
    transitionFunction[state] = { [symbol0]: nextState0, [symbol1]: nextState1 };
  }

  // Extract start state
  const startStateMatch = res.match(startStateRegex);
  const startState = startStateMatch ? startStateMatch[1] : null;

  // Extract final states
  const finalStatesMatch = res.match(finalStatesRegex);
  const finalStates = finalStatesMatch ? finalStatesMatch[1].split(',').map(state => state.trim().replace(/'/g, '')) : [];

  // Log the extracted information
  console.log("Transition Function:", transitionFunction);
  console.log("Start State:", startState);
  console.log("Final States:", finalStates);

  // Generate an input string based on the DFA
  const generatedInput = generateInputBasedOnDFA(transitionFunction, startState, finalStates);
  return generatedInput;
}

document.getElementById("m").addEventListener('click', function () {
  loadLibrary('viz-lite');
  setTimeout(function() {
  generateDFA();
  },500);
  setTimeout(function() {
  const generatingInput = generateinput();
  document.getElementById("generatedinput").innerHTML = "String example accepted by your minimized machine : " + generatingInput;
  document.getElementById("string").style.display="inline-block";
  },1000);
})


function generateInputBasedOnDFA(transitionFunction, startState, finalStates) {
  let currentState = startState;
  let inputString = '';

  while (!finalStates.includes(currentState)) {
    const symbols = Object.keys(transitionFunction[currentState]);
    const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];

    inputString += randomSymbol;
    currentState = transitionFunction[currentState][randomSymbol];
  }

  return inputString;
}

function isAcceptedByDFA(input, transitionFunction, startState, finalStates) {
  let currentState = startState;

  for (const symbol of input) {
    if (transitionFunction[currentState] && transitionFunction[currentState][symbol]) {
      currentState = transitionFunction[currentState][symbol];
    } else {
      // No transition for the current symbol, reject the input
      return false;
    }
  }

  // Check if the final state is one of the accepted states
  return finalStates.includes(currentState);
}

function checkInput() {
  const inputField = document.getElementById('inputField');
  const userEnteredInput = inputField.value;

  const resultContainer = document.getElementById('resultContainer');
  const res = logTransitionFunction();

  const transitionRegex = /'([^']+)' \{ '([^']+)' : '([^']+)' , '([^']+)' : '([^']+)' \},/g;
  const startStateRegex = /startState = '([^']+)'/;
  const finalStatesRegex = /final = \[([\s\S]+?)\ \];/;

  let transitionFunction = {};
  let match;

  // Extract transition function
  while ((match = transitionRegex.exec(res)) !== null) {
    const [, state, symbol0, nextState0, symbol1, nextState1] = match;
    transitionFunction[state] = { [symbol0]: nextState0, [symbol1]: nextState1 };
  }

  // Extract start state
  const startStateMatch = res.match(startStateRegex);
  const startState = startStateMatch ? startStateMatch[1] : null;

  // Extract final states
  const finalStatesMatch = res.match(finalStatesRegex);
  const finalStates = finalStatesMatch ? finalStatesMatch[1].split(',').map(state => state.trim().replace(/'/g, '')) : [];

  if (userEnteredInput.trim() === '') {
    resultContainer.textContent = 'Please enter a valid input.';
    return;
  }

  const isAccepted = isAcceptedByDFA(userEnteredInput, transitionFunction, startState, finalStates);

  // Display the result
  if (isAccepted) {
    resultContainer.textContent = `The input "${userEnteredInput}" is accepted by the DFA.`;
  } else {
    resultContainer.textContent = `The input "${userEnteredInput}" is rejected by the DFA.`;
  }
}



/**/
function dfa2Text(dfa) {
  let txt = "<h2>Transition Table</h2>";
  txt += "<table id='transitiontable' border='1'>";
  txt += "<tr><th>State</th>";

  // Extracting symbols from the transition table
  let symbols = new Set();
  for (let state in dfa.transition) {
    for (let symbol in dfa.transition[state]) {
      symbols.add(symbol);
    }
  }
  symbols = [...symbols].sort();

  // Adding symbols as column headers
  symbols.forEach(symbol => {
    txt += `<th>${symbol}</th>`;
  });

  txt += "</tr>";

  // Adding transition states
  for (let state in dfa.transition) {
    txt += `<tr><td>${state}</td>`;
    symbols.forEach(symbol => {
      let transitionState = dfa.transition[state][symbol] || '';
      txt += `<td>${transitionState}</td>`;
    });
    txt += "</tr>";
  }

  txt += "</table>";
  txt += "<h2>Final States</h2>";
  txt += "<ul>";

  // Check if finalStates is defined and not nested deeply
  let finalStates = getFinalStates(dfa);
  if (finalStates) {
    finalStates.forEach(finalState => {
      txt += `<li>${finalState}</li>`;
    });
  }

  txt += "</ul>";

  return txt;
}

// Function to handle nested structures
function getFinalStates(dfa) {
  if (dfa.finalStates) {
    return dfa.finalStates; // Use the finalStates directly if not nested
  } else if (dfa.details && dfa.details.finalStates) {
    return dfa.details.finalStates; // Adjust the path if nested under details
  } else if (dfa.final) {
    return dfa.final; // Adjust for different property names if necessary
  } else {
    return null; // Return null if the structure is not recognized
  }
}




function dfa2GraphViz(dfa) {
  let txt = 'digraph{rankdir=LR;node[shape=doublecircle]"' + dfa.final.join('" "') + '";node[shape=circle];';
  for (let state in dfa.transition) {
    let symbols = {};
    for (let symbol in dfa.transition[state]) {
      let endstate = dfa.transition[state][symbol];
      if (symbols[endstate] === undefined) {
        symbols[endstate] = symbol;
      } else {
        symbols[endstate] += ',' + symbol;
      }
    }
    for (let endstate in symbols) {
      txt += '"' + state + '"->"' + endstate + '"[label="' + symbols[endstate] + '"];';
    }
  }
  return txt + '}';
}