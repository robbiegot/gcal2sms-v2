import Layout from "../components/Layout";
import React, { useState, useEffect } from "react";
import { useSession, getSession, signIn } from "next-auth/react";
import { GetServerSideProps } from 'next';
import prisma from '../lib/prisma';
import SettingsTextField from "../components/SettingsText";
import { TransitionProps } from "@mui/material/transitions";
import { Account } from "@prisma/client";
import { useRouter } from 'next/router';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Slide,
    FormGroup,
    Button
} from '@mui/material';

const Slider = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const Settings: React.FC<Props> = ({ accountSettings, readOnlyVals, submissionStatusVals }) => {
    const { data: session, status } = useSession();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [readOnlyTriggers, setReadOnlyTriggers] = useState(readOnlyVals);
    const [submissionStatus, setSubmissionStatus] = useState(submissionStatusVals)
    const router = useRouter();

    //functionality to reload data when a field has been changed

    const refreshData = () => {
        router.replace(router.basePath);
        setIsRefreshing(true);
        return;
    };

    const handleCloseDialog = (event, reason) => {
        if (reason && reason == "backdropClick") {
            router.replace('/');
            return;
        }
        return;
    }

    const submitData = async (e, componentName: string, textSubmission: string) => {
        e.preventDefault();
        try {
            const bodyToSend = (componentName === 'calendar') ? JSON.stringify({ calendarId: textSubmission }) : JSON.stringify({ componentName, textSubmission });
            const updatedUser = await fetch(`/api/settings-API/${componentName}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: bodyToSend
            }).then(res => res.json()
            ).then(info => info)
            setSubmissionStatus(Object.assign({ ...submissionStatus }, { [componentName]: true }));
            router.replace(router.asPath);
        } catch (error) {
            console.error(error);
        }
    };

    const getEventsTest = async (e) => {
        e.preventDefault();
        try {
            const bodyToSend = await JSON.stringify({ calendarId: "bebb89fac3b2ab6f9b9d2749bd5763296f91a9ff1788d946a37cc57baf868278@group.calendar.google.com" })
            const updatedUser = await fetch(`/api/events-from-google/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: bodyToSend
            }).then(res => res.json()
            ).then(info => {
                console.log(info)
                return info
            })
        } catch (error) {
            console.error(error);
        }
    };

    const handleReadOnlyChange = (key: string) => {
        const newReadOnlyVals = {};
        const newTrig = (readOnlyTriggers[key] === true) ? false : true;
        Object.keys(readOnlyTriggers).forEach((field) => newReadOnlyVals[field] = true);
        newReadOnlyVals[key] = newTrig;
        setReadOnlyTriggers(newReadOnlyVals)
        return
    };

    useEffect(() => {
        setIsRefreshing(false);
    }, [accountSettings]);

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
                TransitionComponent={Slider}
                onClose={handleCloseDialog}>
                <DialogTitle>Settings</DialogTitle>
                <DialogContent>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={getEventsTest}>Hello</Button>
                    <FormGroup>
                        {Object.keys(accountSettings).map((setting) => {
                            return (
                                <SettingsTextField
                                    key={'setting_' + setting}
                                    handleReadOnlyChange={handleReadOnlyChange}
                                    readOnlyVal={readOnlyTriggers[setting]}
                                    initialValue={accountSettings[setting]}
                                    componentName={setting}
                                    submitData={submitData}
                                    submissionStatus={submissionStatus[setting]}
                                ></SettingsTextField>
                            )
                        })}
                    </FormGroup>
                </DialogContent>
            </Dialog>
        </Layout>

    )
}

type Props = {
    accountSettings: Account,
    readOnlyVals: any,
    submissionStatusVals: any
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
    const session = await getSession({ req });
    if (!session) {
        res.statusCode = 403;
        return {
            props: {
                accountSettings: { name: 'hello' },
                readOnlyVals: { name: true },
                submissionStatusVals: { name: false }
            }
        };
    }
    try {
        const accountSettings = await prisma.user.findUnique({
            where: {
                email: session.user.email
            },
            select: {
                phoneNumber: true,
                defRmndrStr: true,
                defRmndrTime: true,
                calendar: {
                    select: {
                        googleId: true
                    }
                }
            }
        });
         if (accountSettings.calendar[0]) {
        Object.assign(accountSettings, { calendar: accountSettings.calendar[0].googleId })
    }
    const readOnlyVals = {};
    const submissionStatusVals = {};
    Object.keys(accountSettings).forEach((key) => {
        readOnlyVals[key] = true;
        submissionStatusVals[key] = false;
    });

    return {
        props: {
            accountSettings,
            readOnlyVals,
            submissionStatusVals
        },
    }
} catch(error) {
    console.log('theres been an error in settings 217', error)
    return {
        props: {
            accountSettings: { name: 'hello' },
            readOnlyVals: { name: true },
            submissionStatusVals: { name: false }
        }
    }
}

   
};

export default Settings;