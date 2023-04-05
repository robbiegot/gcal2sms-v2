import Layout from "../components/Layout";
import React, { useState, useEffect } from "react";
import { useSession, getSession, signIn } from "next-auth/react";
import { GetServerSideProps } from 'next';
import prisma from '../lib/prisma';
import SettingsTextField from "../components/SettingsText";
import { useRouter } from 'next/router';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    FormGroup,
} from '@mui/material';
import SettingsSlider from "../components/SettingsSlider";

type Props = {
    accountSettingsProps:any
}

const Settings: React.FC<Props> = ({ accountSettingsProps }) => {
    const { data: session, status } = useSession();
    const [settings, setSettings] = useState(accountSettingsProps);
    const router = useRouter();


    const handleCloseDialog = (event, reason) => {
        if (reason && reason == "backdropClick") {
            router.replace('/');
            return;
        }
        return;
    }
    const submitData = async (componentName:string) => {
        try {
            const updatedUserSetting = await fetch(`/api/settings-API/${componentName}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings[componentName])
            }).then(res => res.json()
            ).then(info => info)
            const newCompSetting = Object.assign(
                {...settings[componentName]}, 
                {value: updatedUserSetting[componentName], submissionStatus: true, readOnly:true})
            setSettings(Object.assign({ ...settings },{ [componentName]: newCompSetting}));
        } catch (error) {
            console.error(error);
        }
    };
    const handleReadOnlyChange = (key: string) => {
        const newTrig = (settings[key].readOnly === true) ? false : true;
        const newCompSetting = Object.assign({...settings[key]}, {readOnly: newTrig})
        setSettings(Object.assign({ ...settings }, {[key]: newCompSetting}));
        return
    };
    const handleTyping = (e, key: string) => {
        const newCompSetting = Object.assign({...settings[key]}, {value: e.target.value})
        setSettings(Object.assign({ ...settings }, {[key]: newCompSetting}));
        return
    }
    useEffect(() => {
        if (session?.error === "RefreshAccessTokenError") {
            console.log('error with signin')
            signIn(); // Force sign in to hopefully resolve error
        }
    }, [session]);

    if (!session) {
        return (
            <Layout>
                <div>You need to be authenticated to view this page.</div>
            </Layout>
        );
    };
    if (status === "loading") {
        return (
            <Layout>
                <p>Loading...</p>
            </Layout>
        )
    }
    if (status === "unauthenticated") {
        return (
            <Layout>
                <p>Access Denied</p>
            </Layout>
        )
    }

    return (
        <Layout>
            <Dialog
                open={true}
                fullWidth={true}
                maxWidth="xl"
                TransitionComponent={SettingsSlider}
                onClose={handleCloseDialog}>
                <DialogTitle>Settings</DialogTitle>
                <DialogContent>
                    <FormGroup>
                        {Object.keys(settings).map((key) => {
                            return (
                                <SettingsTextField
                                    key={'setting_' + key}
                                    handleReadOnlyChange={handleReadOnlyChange}
                                    info={settings[key]}
                                    submitData={submitData}
                                    handleTyping={handleTyping}
                                ></SettingsTextField>
                            )
                        })}
                    </FormGroup>
                </DialogContent>
            </Dialog>
        </Layout>

    )
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
    const session = await getSession({ req });

    if (!session) {
        return {
            redirect: {
                destination: '/auth/signin',
                permanent: false,
            },
        };
    }; 

    try {
        const accountSettings = await prisma.user.findUnique({
            where: {
                email: session.user.email
            },
            select: {
                phoneNumber: true,
                calendar: {
                    select: {
                        googleId: true
                    }
                }
            }
        });
        const accountSettingsProps = {
            phoneNumber: {value: accountSettings.phoneNumber ?? '', readOnly: true, submissionStatus: false, label: "Phone Number", componentName: "phoneNumber"},
            calendarId: {value: accountSettings?.calendar[0]?.googleId ?? '', readOnly: true, submissionStatus: false, label: "Calendar ID From Google", componentName: "calendarId"}
        }; 
        return {
            props: {
                accountSettingsProps, 
            },
        }
    } catch (error) {
        console.log('theres been an error in settings 217', error)
        return {
            props: {
                accountSettingsProps: null,
            }
        }
    }
};

export default Settings;