import { useState } from 'react';
import fetchPictures from 'components/API/pixabayImages-api';
import { ImageGallery } from './ImageGallery/ImageGallery';
import { Button } from './Button/Button';
import { Loader } from './Loader/Loader';
import Modal from './Modal/Modal';
import Searchbar from './Searchbar/Searchbar';
import style from './Searchbar/Searchbar.module.css';
import { useEffect } from 'react';

const Status = {
  IDLE: 'idle',
  PENDING: 'pending',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
};

export default function App() {
  const [imageName, setImageName] = useState('');
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [showButton, setShowButton] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState(Status.IDLE);
  const [modalImage, setModalImage] = useState('');
  const [imageAlt, setImageAlt] = useState('');

  useEffect(() => {
    if (!imageName) {
      return;
    }

    async function fetchImages() {
      setStatus(Status.PENDING);

      try {
        const images = await fetchPictures(imageName, page);

        if (images.hits.length < 1) {
          setShowButton(false);
          setStatus(Status.IDLE);
          return alert('No images on your query');
        }

        setImages(prevState => [...prevState, ...images.hits]);
        setShowButton(page < Math.ceil(images.total / 12) ? true : false);

        console.log(images.hits);
        setStatus(Status.RESOLVED);
      } catch (error) {
        console.log(error);
        setStatus(Status.REJECTED);
      }
    }

    fetchImages();
  }, [imageName, page]);

  const handleFormSubmit = searchImage => {
    if (searchImage === imageName) {
      return;
    }

    setImageName(searchImage);
    setPage(1);
    setImages([]);
    setShowButton(false);
    setShowModal(false);
    setStatus(Status.IDLE);
  };

  const loadMoreImages = () => {
    setPage(prevState => prevState + 1);
  };

  const handleModalImage = event => {
    setModalImage(event);
  };

  const handleModalAlt = event => {
    setImageAlt(event);
  };

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  return (
    <>
      <Searchbar onSubmit={handleFormSubmit} />

      {status === Status.IDLE && (
        <h2 className={style.EmptySearch}>Search something!</h2>
      )}

      {status === Status.PENDING && <Loader />}

      {images.length > 0 && (
        <ImageGallery
          showModal={toggleModal}
          images={images}
          handleModalImage={handleModalImage}
          handleModalAlt={handleModalAlt}
        />
      )}

      {showButton && <Button onClick={loadMoreImages} />}

      {showModal && (
        <Modal onClose={toggleModal}>
          <img src={modalImage} alt={imageAlt} />
        </Modal>
      )}
    </>
  );
}
