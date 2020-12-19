import React, { useState, useEffect } from 'react'
import phonebookService from './services/contacts'
import './index.css'

const Heading = ({text}) => <h2>{text}</h2>

const SearchFilter = ({filterText, onChange}) => {
  return (
    <div>
      filter shown with : <input value={filterText} onChange={onChange} />
    </div>
  )
}

const PersonForm = ({addNewContact, handleNameInput, newName, hendleNumberInput, newNumber}) => {
  return (
    <form onSubmit={addNewContact}>
      <div>
        name: <input onChange={handleNameInput} value={newName}/>
      </div>
      <div>
        number : <input onChange={hendleNumberInput} value={newNumber}/>
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  )
}

const Person = ({person, deleteContactOf}) => {
  return (
    <li>
      {person.name} : {person.number}
      <button onClick={()=>deleteContactOf(person.id)}>
        delete
      </button>
    </li>
  )
}

const Persons = ({personsToShow, deleteContactOf}) => {
  return (
    <ul>
        {personsToShow.map(person => <Person key={person.id} person={person} deleteContactOf={deleteContactOf}/>)}
      </ul>
  )
}

const Notification = ({notificationMessage}) => {
  //console.log(`message is ${notificationMessage}`);
  
  if(notificationMessage === null)
    return null;
  //console.log(`test ${notificationMessage.startsWith('Succcess')}`);
  if(notificationMessage.startsWith('Success')){
    return (
      <div className='success'>
        {notificationMessage}
      </div>
    )
  }
  else{
    return (
      <div className='error'>
        {notificationMessage}
      </div>
    )
  }
}

const App = () => {
  const [persons, setPersons] = useState([]) 
  const [ newName, setNewName ] = useState('')
  const [ newNumber, setNewNumber] = useState('')
  const [ filterText, setFilterText ] = useState('')
  const [ notificationMessage, setNotificationMessage ] = useState(null)

  useEffect(()=>{
    console.log('effect');
    phonebookService
      .getAll()
      .then(initialContacts => setPersons(initialContacts))
  },[]);
  console.log('render ',persons.length,' contacts');

  const handleNameInput = (event) => {
    setNewName(event.target.value);
  }

  const hendleNumberInput = (event) => {
    setNewNumber(event.target.value);
  }

  const handleFilterTextInput = (event) => {
    setFilterText(event.target.value);
  }

  

  const clearFields = () => {
    setNewName('');
    setNewNumber('');
    setFilterText('');
  }

  const addNewContact = (event) => {
    
    event.preventDefault();
    let allNames = persons.map(p => p.name);
    if(allNames.indexOf(newName) !== -1){
      if(window.confirm(`Do you want to update the number of ${newName} ?`)){
        let person = persons.find(p => p.name === newName);
        let modifiedPerson = {...person, number : newNumber};
        phonebookService
          .editContact(modifiedPerson.id, modifiedPerson)
          .then(returnedObject => {
            setPersons(persons.map(p => p.id === returnedObject.id ? returnedObject : p));
            setNotificationMessage(`Successfully changed contact number of '${returnedObject.name}'`);
            clearFields();
            setTimeout(() => {
              setNotificationMessage(null)
            }, 5000);
          })
          .catch(error => {   
            //console.log(error.response);         
            if(error.response.status === 404){
              setNotificationMessage(`Contact '${person.name}' has already been removed from server`);
              setPersons(persons.filter(p => p.id !== person.id));
              clearFields();                            
            }
            else {
              setNotificationMessage(error.response.data.error);
            }
            setTimeout(() => {
              setNotificationMessage(null)
            }, 5000);            
          })
      }
      
      return;
    }
    
    let newPerson = {
      name: newName,
      number : newNumber 
    }
    
    phonebookService
      .create(newPerson)
      .then(returnedObject => {
        setPersons(persons.concat(returnedObject));
        clearFields();
        setNotificationMessage(`Successfully added new contact '${returnedObject.name}'`);
        setTimeout(() => {
          setNotificationMessage(null)
        }, 5000);
      })
      .catch(error => {
        let errorMessage = error.response.data.error;
        //clearFields();
        setNotificationMessage(errorMessage);
        setTimeout(() => {
          setNotificationMessage(null)
        }, 5000);
      })   
  }
  
  let personsToShow = filterText === '' ? persons : persons.filter(person => person.name.toLowerCase().includes(filterText.toLowerCase()));
  
  const deleteContactOf = (id) => {
    let person = persons.find(p => p.id === id);
    if(window.confirm(`Do you really want to delete ${person.name}?`)){
      phonebookService
        .removeContact(id)
        .then(returnedObject => {
          //console.log(returnedObject);
          setPersons(persons.filter(p => p.id !== id));
          setNotificationMessage(`Successfully deleted contact '${person.name}'`);
            setTimeout(() => {
              setNotificationMessage(null)
            }, 5000);
        })
    }
  }

  return (
    <div>
      <Heading text="Phonebook" />

      <Notification notificationMessage={notificationMessage} />
      
      <SearchFilter filterText={filterText} onChange={handleFilterTextInput} />
      
      <Heading text="Add a New" />
      
      <br/>
      
      <PersonForm 
      addNewContact={addNewContact} 
      handleNameInput={handleNameInput}
      newName = {newName}
      hendleNumberInput = {hendleNumberInput}
      newNumber = {newNumber}
      />
      
      <br/>
      <Heading text="Number" />
      
      <Persons personsToShow={personsToShow} deleteContactOf={deleteContactOf}/>
      
      
    </div>
  )
}

export default App