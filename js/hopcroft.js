function DFA(transition, final, initialState) {
	this.transition = transition;
	this.final = final;
	this.initialState = initialState;
  }
  

  DFA.prototype.minimize = function (mode) {
    function equals(set1, set2) {
        if (set1.size !== set2.size)
            return false;
        for (let item of set2)
            if (!set1.has(item))
                return false;
        return true;
    }

    function intersection(set1, set2) {
        return new Set([...set1].filter(x => set2.has(x)));
    }

    function difference(set1, set2) {
        return new Set([...set1].filter(x => !set2.has(x)));
    }

    let states = new Set();
    let symbols = new Set();
    for (let state in this.transition) {
        states.add(state);
        for (let symbol in this.transition[state]) {
            symbols.add(symbol);
        }
    }
    symbols = [...symbols].sort();

    let finalstates = new Set();
    for (let i in this.final) {
        finalstates.add(this.final[i]);
    }

    let P = new Array(difference(states, finalstates), finalstates);
    let W = new Array(finalstates);

    while (W.length > 0) {
        let A = W.pop();

        for (let i in symbols) {
            let c = symbols[i];

            let X = new Set();
            for (let state in this.transition) {
                if (A.has(this.transition[state][c])) {
                    X.add(state);
                }
            }

            if (X.size > 0) {
                for (let j = 0 ; j < P.length ; j++) {
                    let Y = P[j];
                    let intersect = intersection(X, Y);
                    let diff = difference(Y, X);

                    if (intersect.size > 0 && diff.size > 0) {
                        P.splice(j, 1, intersect, diff);

                        let found = false;
                        for (let k in W) {
                            if (equals(W[k], Y)) {
                                W.splice(k, 1, intersect, diff);
                                found = true;
                                break;
                            }
                        }

                        if (!found) {
                            if (intersect.size <= diff.size) {
                                W.push(intersect);
                            } else {
                                W.push(diff);
                            }
                        }
                    }
                }
            }
        }
    }

    P.sort(function (set1, set2) {
        let state1 = [...set1][0], state2 = [...set2][0];
        if (state1 < state2)
            return -1;
        else if (state1 === state2)
            return 0;
        else
            return 1;
    });

    let statenames = [];
    for (let i in P) {
        let txt = '';
        switch (mode) {
            case 'digits':
                txt = i.toString();
                break;
            case 'letters':
                let n = parseInt(i) + 1;
                let offset = 'a'.charCodeAt(0);
                while (n > 0) {
                    n -= 1;
                    txt = String.fromCharCode((n % 26) + offset) + txt;
                    n = Math.floor(n / 26);
                }
                break;
            case 'names':
                txt = [...P[i]].join(',');
                break;
            default:
                txt = '<error>';
        };
        statenames.push(txt);
    }

    let newTransitions = {};
    let newFinals = [];
    let newStartState;

    for (let i in P) {
        let stateinP = [...P[i]][0];
        let newTrans = {};

        for (let symbol in this.transition[stateinP]) {
            for (let j in P) {
                if (P[j].has(this.transition[stateinP][symbol])) {
                    newTrans[symbol] = statenames[j];
                    break;
                }
            }
        }
        newTransitions[statenames[i]] = newTrans;

        if (this.final.indexOf(stateinP) > -1) {
            newFinals.push(statenames[i]);
        }

        if (this.startState === stateinP) {
            newStartState = statenames[i];
        }
    }

    return new DFA(newTransitions, newFinals, newStartState);
};


