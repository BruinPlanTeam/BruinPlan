import { useState } from 'react'

// Import components
import { SearchBar } from './SearchBar';
import { Header } from './Header';

export default function HomeScreen() {
    return (
        <> 
        <Header />
        <h1>Bruinplan</h1>
        <SearchBar></SearchBar>
        </>
    );
}