import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UploadCars.css';

function UploadCars() {
  const [file, setFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('');
  const [collections, setCollections] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [notification, setNotification] = useState({ message: '', isError: false });

  // collections
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/collections');
        setCollections(response.data);
      } catch (error) {
        console.error('Error fetching collections:', error);
        showNotification('Error fetching collections', true);
      }
    };

    fetchCollections();
  }, []); // load collections

  const showNotification = (message, isError = false) => {
    setNotification({ message, isError });
    setTimeout(() => {
      setNotification({ message: '', isError: false });
    }, 2000);
  };

  const createNewCollection = async () => {
    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const newCollectionName = `${year}_${month}_${day}`;

      if (collections.includes(newCollectionName)) {
        showNotification('Collection for today already exists', true);
        return;
      }

      const response = await axios.post('http://localhost:5000/api/create-collection', {
        name: newCollectionName
      });

      if (response.data.success) {
        const collectionsResponse = await axios.get('http://localhost:5000/api/collections');
        setCollections(collectionsResponse.data);
        setSelectedCollection(newCollectionName);
        showNotification('New collection created successfully');
      } else {
        showNotification(response.data.message || 'Failed to create new collection', true);
      }
    } catch (error) {
      console.error('Error creating collection:', error);
      showNotification('Error creating collection', true);
    }
  };

  // file selection
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setSelectedFileName(selectedFile ? selectedFile.name : '');
  };

  //  file upload
  const handleFileUpload = async (event) => {
    event.preventDefault();

    if (!file) {
      showNotification('Please select a file first', true);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('collection', selectedCollection);

    try {
      const response = await axios.post('http://localhost:5000/api/upload-cars', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      showNotification(response.data.message || 'File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      showNotification('Error uploading file', true);
    }
  };

  const handleDeleteClick = () => {
    if (!selectedCollection) {
      showNotification('Please select a collection to delete', true);
      return;
    }
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (confirmationText !== selectedCollection) {
      return;
    }

    try {
      const response = await axios.delete('http://localhost:5000/api/delete-collection', {
        data: { name: selectedCollection }
      });

      if (response.data.success) {
        const collectionsResponse = await axios.get('http://localhost:5000/api/collections');
        setCollections(collectionsResponse.data);
        setSelectedCollection('');
        showNotification('Collection deleted successfully');
      } else {
        showNotification(response.data.message || 'Failed to delete collection', true);
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
      showNotification('Error deleting collection', true);
    }

    setShowDeleteModal(false);
    setConfirmationText('');
  };

  return (
    <div>
      <div id="TopMid">Upload .CSV</div>
      <form onSubmit={handleFileUpload}>
        <div className="collection-selector">
          <select 
            value={selectedCollection} 
            onChange={(e) => setSelectedCollection(e.target.value)}
            className="collection-select"
          >
            <option value="">Select Collection</option>
            {collections.map(collection => (
              <option key={collection} value={collection}>
                {collection}
              </option>
            ))}
          </select>
        </div>

        <button 
          type="button" 
          className="create-collection-button"
          onClick={createNewCollection}
        >
          Create 
        </button>

        <button 
          type="button" 
          className="delete-collection-button"
          onClick={handleDeleteClick}
        >
          Delete 
        </button>

        <label for="file" class="custum-file-upload">
          <div class="icon">
            <svg viewBox="0 0 24 24" fill="" xmlns="http://www.w3.org/2000/svg">
              <g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M10 1C9.73478 1 9.48043 1.10536 9.29289 1.29289L3.29289 7.29289C3.10536 7.48043 3 7.73478 3 8V20C3 21.6569 4.34315 23 6 23H7C7.55228 23 8 22.5523 8 22C8 21.4477 7.55228 21 7 21H6C5.44772 21 5 20.5523 5 20V9H10C10.5523 9 11 8.55228 11 8V3H18C18.5523 3 19 3.44772 19 4V9C19 9.55228 19.4477 10 20 10C20.5523 10 21 9.55228 21 9V4C21 2.34315 19.6569 1 18 1H10ZM9 7H6.41421L9 4.41421V7ZM14 15.5C14 14.1193 15.1193 13 16.5 13C17.8807 13 19 14.1193 19 15.5V16V17H20C21.1046 17 22 17.8954 22 19C22 20.1046 21.1046 21 20 21H13C11.8954 21 11 20.1046 11 19C11 17.8954 11.8954 17 13 17H14V16V15.5ZM16.5 11C14.142 11 12.2076 12.8136 12.0156 15.122C10.2825 15.5606 9 17.1305 9 19C9 21.2091 10.7909 23 13 23H20C22.2091 23 24 21.2091 24 19C24 17.1305 22.7175 15.5606 20.9844 15.122C20.7924 12.8136 18.858 11 16.5 11Z" fill=""></path> </g></svg>
          </div>
          <div class="text">
            {selectedFileName ? (
              <span className="selected-file">{selectedFileName}</span>
            ) : (
              <span>Click to upload file</span>
            )}
          </div>
          <input id="file" type="file" onChange={handleFileChange} />
        </label>

        {selectedFileName && (
          <button type="submit" className="upload-button">Upload</button>
        )}
      </form>

      {/* 删除确认模态框 */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button 
              className="modal-close" 
              onClick={() => {
                setShowDeleteModal(false);
                setConfirmationText('');
              }}
            >
              ×
            </button>
            <div className="modal-header">
              <h3>Drop Collection</h3>
            </div>
            <div className="modal-body">
              <span>
                To drop the collection <strong>{selectedCollection}</strong>, 
                type the name to confirm.
              </span>
              <input
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="Enter collection name"
              />
            </div>
            <div className="modal-footer">
              <button 
                className="modal-button modal-button-cancel"
                onClick={() => {
                  setShowDeleteModal(false);
                  setConfirmationText('');
                }}
              >
                Cancel
              </button>
              <button 
                className="modal-button modal-button-danger"
                disabled={confirmationText !== selectedCollection}
                onClick={handleConfirmDelete}
              >
                Drop
              </button>
            </div>
          </div>
        </div>
      )}
      {notification.message && (
        <div className={`notification ${notification.isError ? 'error' : ''}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
}

export default UploadCars;
