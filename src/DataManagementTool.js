import React, { useState, useRef } from 'react';
import GameForm from './GameForm';
import "./Form.css"

import axios from 'axios';

import { ListBox } from 'primereact/listbox';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

function DataManagementTool(props) {
    const [database, setDatabase] = useState('');
    const [availableDatabases] = useState(['MySQL', 'SQLite', 'MongoDB']);
    const toastRef = useRef();

    const onDeleteButtonClick = async () => {
        if (database === '') {
            toastRef.current.show({ severity: 'error', summary: 'Erreur', detail: 'Merci de sélectionner une base de donnée' });
        } else {
            await axios.post('http://localhost:5000/api/database-choice', {
                database: database,
            });
            if (database === 'MySQL' || database === 'SQLite') {
                await axios.delete('http://localhost:5000/api/reset-database');
                if (database === 'MySQL') {
                    toastRef.current.show({ severity: 'info', summary: 'Succès', detail: 'Toutes les données de la base MySQL ont été supprimés' });
                } else {
                    toastRef.current.show({ severity: 'info', summary: 'Succès', detail: 'Toutes les données de la base SQLite ont été supprimés' });
                }
            } else {
                await axios.delete('http://localhost:5000/api/mongo/reset-database');
                toastRef.current.show({ severity: 'info', summary: 'Succès', detail: 'Toutes les données de la base MongoDB ont été supprimés' });
            }
        }
    };

    const onExportButtonClick = async () => {
        if (database === '') {
            toastRef.current.show({ severity: 'error', summary: 'Erreur', detail: 'Merci de sélectionner une base de donnée' });
        } else {
            await axios.post('http://localhost:5000/api/database-choice', {
                database: database,
            });
            if (database === 'MySQL') {
                const response = await axios.get('http://localhost:5000/api/mysql/export');
                const blob = new Blob([response.data], { type: 'application/sql' });
                const blobURL = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobURL;
                link.download = 'mysql-export.sql';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toastRef.current.show({ severity: 'info', summary: 'Succès', detail: 'Toutes les données de la base MySQL ont été exportées dans vos téléchargements' });
            } else if (database === 'SQLite') {
                const response = await axios.get('http://localhost:5000/api/sqlite/export');
                const blob = new Blob([response.data], { type: 'application/sql' });
                const blobURL = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobURL;
                link.download = 'sqlite-export.sql';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toastRef.current.show({ severity: 'info', summary: 'Succès', detail: 'Toutes les données de la base MySQL ont été exportées' });
            } else {
                const response = await axios.get('http://localhost:5000/api/mongo/export', { responseType: 'text' });
                const jsonData = JSON.parse(response.data);
                const jsonString = JSON.stringify(jsonData, null, 2);
                const blob = new Blob([jsonString], { type: 'application/json' });
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = 'mongo-export.json';
                link.click();
                toastRef.current.show({ severity: 'info', summary: 'Succès', detail: 'Toutes les données de la base MongoDB ont été exportées' });
            }
        }
    };


    const onButtonClick = async () => {
        if (database === '') {
            toastRef.current.show({ severity: 'error', summary: 'Erreur', detail: 'Merci de sélectionner une base de donnée' });
        } else {
            await axios.post('http://localhost:5000/api/database-choice', {
                database: database,
            });
        }
    };

    return (
        <div className="data">
            <Toast ref={toastRef} />
            <h1>Outil de gestion de données</h1>
            <ListBox value={database} onChange={(e) => setDatabase(e.value)} options={availableDatabases} className="w-full md:w-14rem" />
            <Button className='button' type="button" label="Effacer les données" onClick={onDeleteButtonClick} />
            <Button className='button' type="button" label="Exporter les données" onClick={onExportButtonClick} />
            <Button className='button' type="button" label="Importer les données" onClick={onButtonClick} />
        </div>
    );
}

export default DataManagementTool;
