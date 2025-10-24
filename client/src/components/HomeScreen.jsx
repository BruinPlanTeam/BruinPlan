import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

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