import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { collection, addDoc, updateDoc, doc, getDoc, getDocs, query, where, deleteDoc } from "firebase/firestore";
import db from '../firebase/FirebaseDB';
import { useContext } from "react";
import { AuthContext } from "../components/AuthProvider";
import AppContainer from "../components/AppContainer";
import AppModal from '../components/AppModal';
import { retrieveUser, retrieveGardens, clearGardens } from '../utilities/FirebaseUtils';

// Bootstrap Imports
import { PersonCircle } from 'react-bootstrap-icons';
import Image from 'react-bootstrap/Image';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Modal from 'react-bootstrap/Modal';

// Style Imports
import '../style/home.css';
import 'bootstrap/dist/css/bootstrap.css';

export default function Profile() {
    const { user } = useContext(AuthContext);
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [clearGardensShow, setClearGardenShow] = useState(false);

    useEffect(() => {

        retrieveUser(id)
        .then((data) => {
            setUserData(data);
            setLoading(false);
        })

    }, [id, user]);

    const handleClearGardens = () => {
        clearGardens(user.uid);
        setClearGardenShow(false);
    }

    const handleClearGardensClose = () => {
        setClearGardenShow(false);
    }

    const handleClearGardensShow = () => {
        setClearGardenShow(true);
    }

    return (
        <AppContainer>
            <div className='profile d-flex flex-column align-items-center'>
                {/* Profile Image */}
                <div className='profile-image-wrapper'>
                    {(user && user.profileUrl) ?
                        <Image className='profile-image' src={user.profileUrl} roundedCircle />
                        : <PersonCircle className='profile-image' size={124} />
                    }
                </div>

                {/* Profile Info */}
                <div className='heading mt-4 d-flex flex-column align-items-center'>
                    <h2>{(user && user.displayName) ? user.displayName : 'Username'}</h2>
                    <p>{(user && user.displayName) ? user.email : 'Email'}</p>
                    {(!loading && userData) &&
                        <p>{(userData.gardens.length !== 1) ? `${userData.gardens.length} Gardens` : '1 Garden'}</p>
                    }
                </div>

                {/* Profile Options */}
                <ButtonGroup className='options'>
                    <Button
                        variant="outline-danger"
                        disabled={loading}
                        onClick={() => handleClearGardensShow()}
                    >
                        {loading ? 'Loading…' : 'Clear Gardens'}
                    </Button>
                </ButtonGroup>
                <AppModal
                    title='Warning: Clear Gardens'
                    body={`You will clear ${userData ? userData.gardens.length : ''} gardens!`}
                    show={clearGardensShow}
                    onHide={() => handleClearGardensClose()}
                    options={[
                        {
                            label: 'Clear Gardens',
                            variant: 'danger',
                            onClick: () => handleClearGardens(),
                        },
                        {
                            label: 'Cancel',
                            variant: 'outline-primary',
                            onClick: () => handleClearGardensClose(),
                        }
                    ]}
                />
            </div>
        </AppContainer>
    );
}