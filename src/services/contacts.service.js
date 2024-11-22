// import { DEFAULT_AVATAR } from '@/constants';

// /**
//  * @param {string} url
//  * @param {RequestInit} options
//  * @returns Promise<Response>
// */

// async function efetch(url, options = {}) {
//     let result = {};
//     let json = {};

//     try {
//         result = await fetch(url, options);
//         json = await result.json();
//     } catch (error) {
//         throw new Error(error.message);
//     }

//     if (!result.ok || json.status !== 'success') {
//         throw new Error(json.message);
//     }

//     return json.data;
// }

// function makeContactsService() {
//     // const baseUrl = 'http://localhost:3000/api/v1/contacts';
//     const baseUrl = 'https://ct313hm01-contactbook-api-irisgranger.onrender.com/api/v1/contacts';
//       async function fetchAllContacts() {
//         let url = `${baseUrl}`;  // Lấy tất cả liên hệ
//         const data = await efetch(url);

//         data.contacts = data.contacts.map((contact) => {
//             return {
//                 ...contact,
//                 avatar: contact.avatar ?? DEFAULT_AVATAR
//             };
//         });

//         return data;
//     }
//     async function fetchContacts(page, limit = 10) {
//         let url = `${baseUrl}?page=${page}&limit=${limit}`;
//         const data = await efetch(url);

//         data.contacts = data.contacts.map((contact) => {
//             return {
//                 ...contact,
//                 avatar: contact.avatar ?? DEFAULT_AVATAR
//             };
//         });

//         return data;
//     }

//     async function fetchContact(id) {
//         const { contact } = await efetch(`${baseUrl}/${id}`);
//         return {
//             ...contact,
//             avatar: contact.avatar ?? DEFAULT_AVATAR
//         };
//     }


//     async function createContact(contact) {
//         return efetch(baseUrl, {
//             method: 'POST',
//             body: contact,
//         });
//     }




//     async function deleteAllContacts() {
//         return efetch(baseUrl, {
//             method: 'DELETE',
//         });
//     }

//     async function updateContact(id, contact) {
//         console.log(id)
//         return efetch(`${baseUrl}/${id}`, {
//             method: 'PUT',
//             body: contact,
//         });
//     }
//     async function deleteContact(id) {
//         return efetch(`${baseUrl}/${id}`, {
//             method: 'DELETE',
//         });
//     }

//     return {
//         fetchContacts,
//         fetchContact,
//         createContact,
//         updateContact,
//         deleteContact,
//         deleteAllContacts,
//         fetchAllContacts
//     };
// }

// export default makeContactsService();