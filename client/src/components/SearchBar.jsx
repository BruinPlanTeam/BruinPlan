import React, { useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom';

import AnimatedList from './AnimatedList';
import { useMajor } from '../Major';
import { retrieveMajors } from '../services/majorService'
import '../styles/SearchBar.css' 


export function SearchBar() {
  const { handleMajorSelect } = useMajor();

  const [majorList, setMajorList] = useState([])

  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState([])

  const navigate = useNavigate();
  
  useEffect(() =>  {
    async function fetchData(){
      try{
        const majors = await retrieveMajors()
        setMajorList(majors)
        console.log("edited major list")
      } catch(e){
        console.error("Error retrieving majors: ", e)
      }
    }
    fetchData()
  }, [])


function rankSuggestions(e) {
  const value = e.target.value;
  setInputValue(value);

  if (value.length > 0) {
    const query = value.toLowerCase();

    const matches = majorList.filter(major =>
      major.toLowerCase().includes(query)
    );

    const rankedSuggestions = matches
      .map(major => {
        const lowerMajor = major.toLowerCase()
        let rank = 0

        if (lowerMajor === query) {
          rank = 100
        } else if (lowerMajor.startsWith(query)) {
          rank = 50;
        } else if (lowerMajor.includes(` ${query}`)){
          rank = 30
        }
        else {
          const index = lowerMajor.indexOf(query);
          rank = 20 - index;
        }
        return { major, rank }
      })
      .sort((a, b) => {
        if (b.rank != a.rank) {
          return b.rank - a.rank
        }
        return a.major.localeCompare(b.major)
      })
      .map(item => item.major)

      setSuggestions(rankedSuggestions)
    } else {
      setSuggestions([])
      handleMajorSelect(null)
    }
  };

  const handleSelect = (value) => {
    setInputValue(value);
    setSuggestions([]);
    handleMajorSelect(value);
    navigate('/degreeplan');  
  };

  return (
    <div className='search-bar-container'>
      <input className='search-bar' type="text" value={inputValue} onChange={rankSuggestions} placeholder="Enter a Major" />
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

