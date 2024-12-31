function checkEquivalence() {
    const dfa1 = getDFA("1");
    const dfa2 = getDFA("2");

    if (areDFAsEquivalent(dfa1, dfa2)) {
        document.getElementById("alert").innerHTML="The DFAs are equivalent.";
    } else {
        document.getElementById("alert").innerHTML="The DFAs are not equivalent.";
    }
}

function getDFA(number) {
    const statesInput = document.getElementById(`states${number}`);
    const alphabetInput = document.getElementById(`alphabet${number}`);
    const transitionFunctionInput = getTransitionFunction(`transitionTable${number}`);
    const initialStateInput = document.getElementById(`initialState${number}`);
    const acceptingStatesInput = document.getElementById(`acceptingStates${number}`);

    const states = statesInput.value.split(',').map(state => state.trim());
    const alphabet = alphabetInput.value.split(',').map(symbol => symbol.trim());

    
    const transitionFunction = {};
    transitionFunctionInput.split(';').forEach(transition => {
        const [from, symbol, to] = transition.split(',');
        if (!transitionFunction[from]) {
            transitionFunction[from] = {};
        }
        transitionFunction[from][symbol] = to;
    });

    const initialState = initialStateInput.value.trim();
    const acceptingStates = acceptingStatesInput.value.split(',').map(state => state.trim());

    return {
        states,
        alphabet,
        transitionFunction,
        initialState,
        acceptingStates
    };
}

function areDFAsEquivalent(dfa1, dfa2) {
    if ((dfa1.acceptingStates.includes(dfa1.initialState) && !dfa2.acceptingStates.includes(dfa2.initialState)) ||
        (!dfa1.acceptingStates.includes(dfa1.initialState) && dfa2.acceptingStates.includes(dfa2.initialState))) {
        return false; 
    }

    const queue = [[dfa1.initialState, dfa2.initialState]];
    const visited = new Set();

    while (queue.length > 0) {
        const [state1, state2] = queue.shift();

        if ((dfa1.acceptingStates.includes(state1) && !dfa2.acceptingStates.includes(state2)) ||
            (!dfa1.acceptingStates.includes(state1) && dfa2.acceptingStates.includes(state2))) {
            return false; 
        }

      
        visited.add(`${state1},${state2}`);

    
        for (const symbol of dfa1.alphabet) {
            const nextState1 = dfa1.transitionFunction[state1][symbol];
            const nextState2 = dfa2.transitionFunction[state2][symbol];

            const nextPair = `${nextState1},${nextState2}`;

            // Add unvisited pairs to the queue
            if (!visited.has(nextPair)) {
                queue.push([nextState1, nextState2]);
            }
        }
    }

    
    return true;
}

function generateDFAGraph(states, alphabet, transitionFunction, initialState, acceptingStates) {
    let dotSyntax = 'digraph DFA {\n';
    dotSyntax += '  rankdir=LR;\n';

 
    states.forEach(state => {
        dotSyntax += `  ${state} [shape=${acceptingStates.includes(state) ? 'doublecircle' : 'circle'}];\n`;
    });

  
    transitionFunction.split(';').forEach(transition => {
        const [from, symbol, to] = transition.split(',');
        dotSyntax += `  ${from} -> ${to} [label="${symbol}"];\n`;
    });

    dotSyntax += `  start [shape=none label=""];\n  start -> ${initialState};\n`;
    dotSyntax += '}\n';

    return dotSyntax;
}



function isAcceptableDFA(states, alphabet, transitionFunction) {
    for (const state of states) {
        for (const symbol of alphabet) {
            const transitions = transitionFunction.split(';').map(t => t.split(','));
            const hasTransition = transitions.some(([from, s, to]) => from === state && s === symbol);
            if (!hasTransition) {
                document.getElementById("alert").innerHTML=`DFA is not acceptable. There is no transition defined for state ${state} and symbol ${symbol}.`;
                return false;
            }
        }
    }
    return true;
}
function getTransitionFunction(tableId) {
    const table = document.getElementById(tableId);
    const tbody = table.getElementsByTagName('tbody')[0];
    const rows = tbody.getElementsByTagName('tr');
    let transitionFunction = '';

    if (rows.length === 0) {
        console.log('No rows found');
        return ''; 
    }

  
    const alphabetRow = table.getElementsByTagName('thead')[0].getElementsByTagName('tr')[0];
    const alphabetCells = alphabetRow.getElementsByTagName('td');
    const alphabet = Array.from(alphabetCells).map(cell => cell.innerHTML.trim());

    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');


        const state = cells[0] ? cells[0].innerHTML : '';

        for (let j = 1; j < cells.length; j++) {
            const selectField = cells[j].getElementsByTagName('select')[0];


            const value = selectField ? selectField.value.trim() : '';

            if (value !== '') {
     
                transitionFunction += `${state},${alphabet[j]},${value};`;
            }
        }
    }
    transitionFunction = transitionFunction.slice(0, -1);
    console.log('Final Transition Function:', transitionFunction);

    return transitionFunction;
}






function renderDFA() {
    loadLibrary('viz');
    console.log(getTransitionFunction('transitionTable1'));

    const graphContainer1 = document.getElementById('graph1');
    const graphContainer2 = document.getElementById('graph2');


    const states1 = document.getElementById('states1').value.split(',').map(state => state.trim());
    const alphabet1 = document.getElementById('alphabet1').value.split(',').map(symbol => symbol.trim());
    const transitionFunction1 = getTransitionFunction('transitionTable1');
    const initialState1 = document.getElementById('initialState1').value.trim();
    const acceptingStates1 = document.getElementById('acceptingStates1').value.split(',').map(state => state.trim());

 
    if (!isAcceptableDFA(states1, alphabet1, transitionFunction1)) {
        return;
    }

    const graphDOT1 = generateDFAGraph(states1, alphabet1, transitionFunction1, initialState1, acceptingStates1);

    const viz = new Viz();
    viz.renderSVGElement(graphDOT1)
        .then(element => {
            graphContainer1.innerHTML = '';
            graphContainer1.appendChild(element);
        })
        .catch(error => {
            console.error(error);
        });


    const states2 = document.getElementById('states2').value.split(',').map(state => state.trim());
    const alphabet2 = document.getElementById('alphabet2').value.split(',').map(symbol => symbol.trim());
    const transitionFunction2 = getTransitionFunction('transitionTable2');


    const initialState2 = document.getElementById('initialState2').value.trim();
    const acceptingStates2 = document.getElementById('acceptingStates2').value.split(',').map(state => state.trim());


    if (!isAcceptableDFA(states2, alphabet2, transitionFunction2)) {
        return;
    }


    const graphDOT2 = generateDFAGraph(states2, alphabet2, transitionFunction2, initialState2, acceptingStates2);

    viz.renderSVGElement(graphDOT2)
        .then(element => {
            graphContainer2.innerHTML = '';
            graphContainer2.appendChild(element);
        })
        .catch(error => {
            console.error(error);
        });
        document.getElementById('check-btn').style.display = 'inline-block';
        
}
