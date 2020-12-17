import axios from 'axios'

let baseURL = '/api/persons';

const getAll = () => {
  let request = axios.get(baseURL);
  return request.then(response => response.data);
}

const create = (newObject) => {
  let request = axios.post(baseURL, newObject);
  return request.then(response => response.data);
}

const removeContact = (id) => {
  let request = axios.delete(`${baseURL}/${id}`);
  return request.then(response => response.data);
}

const editContact = (id, newObject) => {
  let request = axios.put(`${baseURL}/${id}`, newObject);
  return request.then(response => response.data);
}

export default {getAll, create, removeContact, editContact}