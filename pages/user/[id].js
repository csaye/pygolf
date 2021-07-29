import Challenge from '../../components/Challenge.js';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import firebase from 'firebase/app';
import { useCollectionData } from 'react-firebase-hooks/firestore';

import styles from '../../styles/User.module.css';

export default function User() {
  const [userData, setUserData] = useState(undefined);

  // retrieve user id from router
  const router = useRouter();
  const { id } = router.query;

  // retrieve user challenges
  const challengesRef = firebase.firestore().collection('challenges');
  const [userChallenges] = useCollectionData(
    challengesRef
    .where('creator', '==', id ?? 'null')
    .orderBy('created', 'desc'),
    { idField: 'id' }
  );

  // retrieves user data from firebase
  async function getUserData() {
    const usersRef = firebase.firestore().collection('users');
    const userDoc = await usersRef.doc(id).get();
    setUserData(userDoc.exists ? userDoc.data() : null);
  }

  // retrieve user data on start
  useEffect(() => {
    if (id) getUserData();
  }, [id]);

  if (userData === undefined) return <div>Loading...</div>;
  if (userData === null) return <div>User not found</div>;

  return (
    <div className={styles.container}>
      {
        firebase.auth().currentUser?.uid === id ?
        <>
          <h1
            className={styles.username}
            onClick={() => setEditing(true)}
          >
            {userData.username}
          </h1>
          <Modal
            open={editing}
            onClose={() => setEditing(false)}
          >
            <div className={`modal ${styles.modal}`}>
              <h1>Username</h1>
              <form onSubmit={e => {
                e.preventDefault();
                changeUsername();
              }}>
                <input
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                  autoComplete="off"
                  required
                />
                <button className="btn btn-primary">
                  Update
                </button>
              </form>
            </div>
          </Modal>
        </> :
        <h1>{userData.username}</h1>
      }
      <hr />
      <div className={styles.challengelist}>
        {
          userChallenges &&
          userChallenges.map(challenge =>
            <Challenge data={challenge} key={challenge.id} />
          )
        }
      </div>
    </div>
  );
}
