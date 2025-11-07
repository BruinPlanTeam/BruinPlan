import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

import AnimatedList from './AnimatedList';
import { useMajor } from '../Major';
import '../styles/SearchBar.css' 

const UCLA_MAJORS = [
  "African American Studies",
  "African and Middle Eastern Studies",
  "American Indian Studies",
  "American Literature and Culture",
  "Ancient Near East and Egyptology",
  "Anthropology",
  "Arabic",
  "Art History",
  "Asian American Studies",
  "Asian Humanities",
  "Asian Languages and Linguistics",
  "Asian Religions",
  "Asian Studies",
  "Astrophysics",
  "Atmospheric and Oceanic Sciences",
  "Atmospheric and Oceanic Sciences/Mathematics",
  "Biochemistry",
  "Biology",
  "Biophysics",
  "Business Economics",
  "Central and East European Languages and Cultures",
  "Chemistry",
  "Chemistry/Materials Science",
  "Chicana and Chicano Studies",
  "Chinese",
  "Classical Civilization",
  "Climate Science",
  "Cognitive Science",
  "Communication",
  "Comparative Literature",
  "Computational Biology",
  "Data Theory",
  "Disability Studies",
  "Earth and Environmental Science",
  "Ecology, Behavior, and Evolution",
  "Economics",
  "English",
  "Environmental Science",
  "European Language and Transcultural Studies",
  "European Languages and Transcultural Studies with French and Francophone",
  "European Languages and Transcultural Studies with German",
  "European Languages and Transcultural Studies with Italian",
  "European Languages and Transcultural Studies with Scandinavian",
  "European Studies",
  "Gender Studies",
  "Geography",
  "Geography/Environmental Studies",
  "Geology",
  "Geology/Engineering Geology",
  "Geophysics",
  "Global Studies",
  "Greek",
  "Greek and Latin",
  "History",
  "Human Biology and Society",
  "International Development Studies",
  "Iranian Studies",
  "Japanese",
  "Jewish Studies",
  "Korean",
  "Labor Studies",
  "Latin",
  "Latin American Studies",
  "Linguistics",
  "Linguistics and Anthropology",
  "Linguistics and Asian Languages and Cultures",
  "Linguistics and Computer Science",
  "Linguistics and English",
  "Linguistics and Philosophy",
  "Linguistics and Psychology",
  "Linguistics and Spanish",
  "Linguistics, Applied",
  "Marine Biology",
  "Mathematics",
  "Mathematics, Applied",
  "Mathematics/Applied Science",
  "Mathematics/Economics",
  "Mathematics, Financial Actuarial",
  "Mathematics for Teaching",
  "Mathematics of Computation",
  "Microbiology, Immunology, and Molecular Genetics",
  "Middle Eastern Studies",
  "Molecular, Cell, and Developmental Biology",
  "Neuroscience",
  "Nordic Studies",
  "Philosophy",
  "Physics",
  "Physiological Science",
  "Political Science",
  "Portuguese and Brazilian Studies",
  "Psychobiology",
  "Psychology",
  "Religion, Study of",
  "Russian Language and Literature",
  "Russian Studies",
  "Sociology",
  "Southeast Asian Studies",
  "Spanish",
  "Spanish and Community and Culture",
  "Spanish and Linguistics",
  "Spanish and Portuguese",
  "Statistics and Data Science",
  "Individual Field of Concentration",
  "Architectural Studies",
  "Art",
  "Dance",
  "Design | Media Arts",
  "World Arts and Cultures",
  "Individual Field of Concentration in the Arts and Architecture",
  "Aerospace Engineering",
  "Bioengineering",
  "Chemical Engineering",
  "Civil Engineering",
  "Computer Engineering",
  "Computer Science",
  "Computer Science and Engineering",
  "Electrical Engineering",
  "Materials Engineering",
  "Mechanical Engineering",
  "Ethnomusicology",
  "Global Jazz Studies",
  "Musicology",
  "Music Composition",
  "Music Education",
  "Music Industry",
  "Music Performance",
  "Nursing - Prelicensure",
  "Public Affairs",
  "Film and Television",
  "Theater",
  "Individual Field of Concentration in Theater, Film and Television",
  "Education and Social Transformation",
  "Public Health"
];

export function SearchBar() {
  const { handleMajorSelect } = useMajor();

  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.length > 0) {
      const filteredSuggestions = UCLA_MAJORS.filter(major =>
        major.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
      handleMajorSelect(null);
    }
  };

  const handleSelect = (value) => {
    setInputValue(value);
    setSuggestions([]);
    handleMajorSelect(value);
    navigate('/degreeplan');  
    console.log("got here");
  };

  return (
    <div className='search-bar-container'>
      <input className='search-bar' type="text" value={inputValue} onChange={handleChange} placeholder="Enter a Major" />
      {suggestions.length > 0 && (
        <AnimatedList
          items={suggestions}
          onItemSelect={(item) => handleSelect(item)}
          showGradients={false}    
          enableArrowNavigation={true}      
          displayScrollbar={false}
      />
      )}
    </div>
  );
}

