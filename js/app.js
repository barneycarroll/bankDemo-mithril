// Parse a page id from the hash value
    function getActivePageId () {
        var h = window.location.hash;
        for (var i = 0; i < accounts.length; i++) {
            if (h.search(accounts[i].name) !== -1) return accounts[i].name;
        }
    
    // default to the accounts page    
        return defaultActivePageId;
    }
    
// Navigation
    function hashChangeHandler () {
    // read the hash value and parse a page id of it
        var id = getActivePageId();
        
    // update app state with it
        store.dispatch(changeHash(id));
    }
    
    
// helper function
    function formatBalance (balance) {
    // add $, and commas
    // solution borrowed from Tom: http://stackoverflow.com/questions/14467433/currency-formatting-in-javascript#answer-14467460
        return '$' + parseFloat(balance).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");  
    }
    
// Render the UI
    window.onload = function () {   
    // init redux state store
        //const logger = reduxLogger.createLogger();
        //const createStoreWithMiddleware = reduxLogger.applyMiddleware(thunk, promise, logger)(Redux.createStore);
        //window.store = createStoreWithMiddleware(reducer, {activePageId: getActivePageId(), accounts: accounts});
        window.store = Redux.createStore(bankApp, {activePageId: getActivePageId(), accounts: accounts});
    
    // Render React
        // content
        ReactDOM.render(
            React.createElement(ReactRedux.Provider, {store: store},
                React.createElement(appContainer, store.getState())
            ),
            document.getElementById('content')
        );
        
        // nav
        ReactDOM.render(
            React.createElement(ReactRedux.Provider, {store: store},
                React.createElement(navContainer, store.getState())
            ),
            document.getElementById('navContainer')
        );
        
    // Listen for hashChanges
        $(window).on('hashchange', hashChangeHandler);
    }
    
// Redux actions
    function changeHash(id) {
        return {
            type: "CHANGE_HASH",
            id: id
        }
    }
    
    function addTransaction(transaction, balance, account) {
        return {
            type: "ADD_TRANSACTION",
            payload: {
                transaction: transaction,
                balance: balance,
                account: account
            }
        }
    }
    
// redux reducer
    function bankApp(state, action) {
        switch(action.type) {
            case "CHANGE_HASH":
                return Object.assign({}, state, {
                    activePageId: action.id
                });
            case "ADD_TRANSACTION":
            // get a ref to the account
                for (var i = 0; i < state.accounts.length; i++) {
                    if (state.accounts[i].name == action.payload.account) {
                        var accountIndex = i;
                        break;
                    }
                }
                
            // is something wrong?
                if (accountIndex == undefined)  {
                    console.error("could not determine account for transaction");
                    return state;
                }
                
            // clone the state
                var newState = Object.assign({}, state);
                
            // add the new transaction
                newState.accounts[accountIndex].transactions.unshift(action.payload.transaction);
            
            // update account balance
                newState.accounts[accountIndex].balance = action.payload.balance;

                return newState;
            default:
                return state;
        }
    }
    
    function selectApp(state) {
        return state;
    }
    
    function selectNav(state) {
        var newState = {
            activePageId: state.activePageId
        }
        return state;
    }
    
    var appContainer = ReactRedux.connect(selectApp)(App);
    var navContainer = ReactRedux.connect(selectNav)(Nav);