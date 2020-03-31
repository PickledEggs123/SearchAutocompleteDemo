import * as React from "react";
import "./AddressSearchBar.css";

/**
 * The input to modify how the [AddressSearchBar] component behaves.
 */
interface IAddressBarProps {}

/**
 * The return type of the suggestions array of IApiResult.
 */
interface IAddressBarSuggestion {
    /**
     * The text name of the suggestion.
     */
    text: string;
}

/**
 * The return type of the free autocomplete address search API.
 */
interface IApiResult {
    /**
     * A list of suggestions for a given API GET request.
     */
    suggestions: IAddressBarSuggestion[];
}

/**
 * The state of the [AddressSearchBar] component.
 */
interface IAddressBarState {
    /**
     * The text currently stored in the [[AddressSearchBar]] Component.
     */
    text: string;
    /**
     * A list of suggestions to display in the dropdown of the [[AddressSearchBar]] component.
     */
    suggestions: IAddressBarSuggestion[];
    /**
     * If the dropdown is visible.
     */
    opened: boolean;
}

/**
 * A list of data to add into the autocomplete search box. Do not use external API since they can fail.
 */
const carMakeSuggestions: string[] = [
    "Dodge",
    "Chevrolet",
    "Toyota",
    "Honda",
    "GMC",
    "Ram",
    "Kia",
    "Hyundai",
    "Mercedes",
    "BMW",
    "Fiat"
];

/**
 * Return a list of matches for the autocomplete search box.
 * @param text
 */
const fetchCarMakeSuggestions = async (text: string): Promise<IApiResult> => {
    const suggestions = [];
    for (const carMake of carMakeSuggestions) {
        if (carMake.toLocaleLowerCase().includes(text.toLocaleLowerCase())) {
            suggestions.push({text: carMake});
        }
    }
    return {suggestions};
};

/**
 * A simple search bar which will display a list of suggestions of car makes.
 */
export default class AddressSearchBar extends React.Component<IAddressBarProps, IAddressBarState> {
    /**
     * Holds a reference to the DOM element containing the entire [[AddressSearchBar]]. This is needed to detect clicks
     * inside or outside of the Component. Only clicks outside of the component will close the dropdown.
     */
    addressBarRef = React.createRef<HTMLDivElement>();

    /**
     * The state is explained by [[IAddressBarState]].
     */
    state = {
        text: "",
        suggestions: [] as IAddressBarSuggestion[],
        opened: false
    };

    /**
     * List of things to do after the component was created.
     */
    componentDidMount(): void {
        // attach a global event listener to the window.
        window.addEventListener("click", this.handleCloseSuggestions);
    }

    /**
     * List of things to do before the component is destroyed.
     */
    componentWillUnmount(): void {
        // remove a global event listener from the window.
        window.removeEventListener("click", this.handleCloseSuggestions);
    }

    /**
     * Changes to perform after each state or prop change. This provides one spot to update dependent settings when the
     * original setting is changed.
     * @param prevProps The previous React Props, used to detect changes in props.
     * @param prevState The previous React State, used to detect changes in state.
     * @param snapshot Not sure.
     */
    componentDidUpdate(prevProps: Readonly<IAddressBarProps>, prevState: Readonly<IAddressBarState>, snapshot?: any): void {
        // changes in text should fetch new suggestions
        if (prevState.text !== this.state.text) {
            this.fetchSuggestions();
        }

        // text is not empty, open menu
        if (prevState.text === "" && this.state.text !== "" && prevState.opened) {
            this.setState({opened: true});
        }

        // text is now empty, close menu
        if (prevState.text !== "" && this.state.text === "") {
            this.setState({opened: false});
        }
    }

    /**
     * Check to see if an EventTarget is inside or outside of the Component.
     * @param element The EventTarget to test.
     */
    elementInsideComponent = (element: EventTarget | null): boolean => {
        // check to see if element is null
        if (element && this.addressBarRef.current !== null) {
            // element is not null, test to see if element is address search bar component
            if (this.addressBarRef.current === element) {
                // is address search bar component, return true
                return true;
            } else {
                // is not address earch bar component, test parent component
                return this.elementInsideComponent((element as HTMLElement).parentElement);
            }
        } else {
            // element is null, no more elements to test, return false
            return false;
        }
    };

    /**
     * Determine if raw json is an [IAddressBarSuggestion] object.
     * @param data The data that could contain [IAddressBarSuggestion].
     */
    isSuggestion = (data: any): data is IAddressBarSuggestion => {
        // all suggestions are objects which contain the text property.
        return typeof data === "object" && typeof data.text === "string";
    };

    /**
     * Fetch a list of suggestions from the backend.
     */
    fetchSuggestions = async () => {
        // perform API request
        const json = await fetchCarMakeSuggestions(this.state.text);

        // extract data from API
        // make sure that JSON contains an array of suggestion objects.
        if (json && json.suggestions instanceof Array && json.suggestions.every(this.isSuggestion)) {
            // get suggestions array from the JSON
            const suggestions: IAddressBarSuggestion[] = json.suggestions.filter((suggestion, index, arr) => {
                // filter the current text field value from the list
                return suggestion.text !== this.state.text;
            });
            // update React State with new suggestions from the API
            this.setState({suggestions});
        }
    };

    /**
     * Copy text from input field to component.
     * @param event The event that updated the input field.
     */
    handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        const text = event.target.value;
        this.setState({text});

        // if text is empty, clear suggestions
        if (text.length === 0) {
            this.setState({suggestions: []});
        }
    };

    /**
     * Copy text from suggestion into the input field.
     * @param suggestion
     */
    handleSelectSuggestion = (suggestion: IAddressBarSuggestion) => () => {
        this.setState({text: suggestion.text, opened: false});
    };

    /**
     * Clear the input field.
     */
    handleClearInput = () => {
        this.setState({text: "", suggestions: []});
    };

    /**
     * Open the suggestions dropdown.
     */
    handleOpenSuggestions = () => {
        this.setState({opened: true});
    };

    /**
     * Close the suggestions dropdown.
     */
    handleCloseSuggestions = (event: MouseEvent) => {
        if (!this.elementInsideComponent(event.target)) {
            this.setState({opened: false});
        }
    };

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return (
            <div className="address-search-bar" ref={this.addressBarRef}>
                {/* The text field */}
                <div>
                    <input className="field"
                           onChange={this.handleInput}
                           onFocus={this.handleOpenSuggestions}
                           placeholder="Type and address here"
                           value={this.state.text}
                    />
                    <button className="clear" onClick={this.handleClearInput}>Clear</button>
                </div>
                {/* The dropdown with suggestions */}
                <div className={`suggestions${this.state.opened ? " open" : " close"}`}>
                    {
                        this.state.suggestions.map(suggestion => {
                            return (
                                <div key={suggestion.text} className="suggestion" onClick={this.handleSelectSuggestion(suggestion)}>
                                    {suggestion.text}
                                </div>
                            );
                        })
                    }
                </div>
            </div>
        )
    }
}
