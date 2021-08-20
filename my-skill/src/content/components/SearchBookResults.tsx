import * as React from 'react';
import {InteractionProps} from '@matterway/interactions';

export interface ISearchResultsProps extends InteractionProps {
    isbnCodes?: string[];
}

export const SearchBookResults: React.FC<ISearchResultsProps> = (props: ISearchResultsProps) => {
    return <></>
}