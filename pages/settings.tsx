import Layout from "../components/Layout";
import React, { useState, useEffect } from "react";
import { useSession, getSession } from "next-auth/react";
import { GetServerSideProps } from 'next';
import prisma from '../lib/prisma';
import SettingsTextField from "../components/SettingsText";
import { TransitionProps } from "@mui/material/transitions";
import { useTheme } from "@mui/system";
import { Account } from "@prisma/client";
import { useRouter } from 'next/router';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Slide,
    FormGroup,
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
    const router = useRouter();

    //functionality to reload data when a field has been changed
    const [isRefreshing, setIsRefreshing] = React.useState(false);
    const refreshData = () => {
        router.replace(router.asPath);
        setIsRefreshing(true);
    };
    React.useEffect(() => {
        setIsRefreshing(false);
    }, [accountSettings]);

    const [readOnlyTriggers, setReadOnlyTriggers] = useState(readOnlyVals);
    const [submissionStatus, setSubmissionStatus] = useState(submissionStatusVals)

    const submitData = async (e, componentName: string, textSubmission: string) => {
        e.preventDefault();
        try {
            const body = {
                componentName: componentName,
                textSubmission: textSubmission
            };
            const updatedUser = await fetch('/api/settings-API', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            }).then(res => res.json()
            ).then(info => info)
            const newSubmissionStatus = {};
            Object.keys(submissionStatus).forEach((key) => newSubmissionStatus[key] = false);
            newSubmissionStatus[componentName] = true;
            setSubmissionStatus(newSubmissionStatus)
            router.replace(router.asPath);
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

    if (!session) {
        return (
            <Layout>
                <h1>My Drafts</h1>
                <div>You need to be authenticated to view this page.</div>
            </Layout>
        );
    };

    return (
        <Layout>
            <Dialog
                open={true}
                fullWidth={true}
                maxWidth="xl"
                TransitionComponent={Slider}>
                <DialogTitle>Settings</DialogTitle>
                <DialogContent>
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
    const accountSettings = await prisma.user.findUnique({
        where: {
            email: session.user.email
        },
        select: {
            phoneNumber: true,
            defRmndrStr: true,
            defRmndrTime: true,
            calendar: true
        }
    });

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
};
export default Settings