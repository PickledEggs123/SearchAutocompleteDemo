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
    text: string;
}

/**
 * The return type of the free autocomplete address search API.
 */
interface IApiResult {
    suggestions: IAddressBarSuggestion[];
}

/**
 * The state of the [AddressSearchBar] component.
 */
interface IAddressBarState {
    text: string;
    suggestions: IAddressBarSuggestion[];
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
    state = {
        text: "",
        suggestions: [] as IAddressBarSuggestion[],
        opened: false
    };

    componentDidUpdate(prevProps: Readonly<IAddressBarProps>, prevState: Readonly<IAddressBarState>, snapshot?: any): void {
        // changes in text should fetch new suggestions
        if (prevState.text !== this.state.text) {
            this.fetchSuggestions();
        }

        // text is not empty, open menu
        if (prevState.text === "" && this.state.text !== "") {
            this.setState({opened: true});
        }

        // text is now empty, close menu
        if (prevState.text !== "" && this.state.text === "") {
            this.setState({opened: false});
        }
    }

    /**
     * Determine if raw json is an [IAddressBarSuggestion] object.
     * @param data The data that could contain [IAddressBarSuggestion].
     */
    isSuggestion = (data: any): data is IAddressBarSuggestion => {
        return data && typeof data.text === "string";
    };

    /**
     * Fetch a list of suggestions from the backend.
     */
    fetchSuggestions = async () => {
        // perform API request
        const json = await fetchCarMakeSuggestions(this.state.text);

        // extract data from API
        if (json && json.suggestions instanceof Array && json.suggestions.every(this.isSuggestion)) {
            const suggestions: IAddressBarSuggestion[] = json.suggestions;
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
        this.setState({text: suggestion.text});
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
    handleCloseSuggestions = () => {
        this.setState({opened: false});
    };

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return (
            <div className="address-search-bar">
                <div>
                    <input className="field"
                           onChange={this.handleInput}
                           onFocus={this.handleOpenSuggestions}
                           onBlur={this.handleCloseSuggestions}
                           placeholder="Type and address here"
                           value={this.state.text}
                    />
                    <button className="clear" onClick={this.handleClearInput}>Clear</button>
                </div>
                <div className={`suggestions${this.state.opened ? " open" : " close"}`}>
                    {
                        this.state.suggestions.map(suggestion => {
                            return (
                                <div className="suggestion" onClick={this.handleSelectSuggestion(suggestion)}>
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