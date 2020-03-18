import * as React from "react";
import axios from "axios";
import "./AddressSearchBar.scss";

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
}

export default class AddressSearchBar extends React.Component<IAddressBarProps, IAddressBarState> {
    state = {
        text: "",
        suggestions: [] as IAddressBarSuggestion[]
    };

    componentDidUpdate(prevProps: Readonly<IAddressBarProps>, prevState: Readonly<IAddressBarState>, snapshot?: any): void {
        if (prevState.text !== this.state.text) {
            this.fetchSuggestions();
        }
    }

    isSuggestion = (data: any): data is IAddressBarSuggestion => {
        return data && typeof data.text === "string";
    };

    fetchSuggestions = async () => {
        const params: URLSearchParams = new URLSearchParams();
        params.append("auth-id", "21102174564513388");
        params.append("prefix", this.state.text);
        const response = await axios.get<IApiResult>(`https://us-autocomplete.api.smartystreets.com/suggest?${params}`);
        if (response.data && response.data.suggestions instanceof Array && response.data.suggestions.every(this.isSuggestion)) {
            const suggestions: IAddressBarSuggestion[] = response.data.suggestions;
            this.setState({suggestions});
        }
    };

    handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        const text = event.target.value;
        this.setState({text});
        if (text.length === 0) {
            this.setState({suggestions: []});
        }
    };

    handleSelectSuggestion = (suggestion: IAddressBarSuggestion) => () => {
        this.setState({text: suggestion.text});
    };

    handleClearInput = () => {
        this.setState({text: "", suggestions: []});
    };

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return (
            <div className="address-search-bar">
                <div>
                    <input className="field" onChange={this.handleInput} placeholder="Type and address here" value={this.state.text}/>
                    <button className="clear" onClick={this.handleClearInput}>Clear</button>
                </div>
                <div className="suggestions">
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