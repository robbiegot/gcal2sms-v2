import Layout from "../components/Layout";
import React, { useState, useEffect } from "react";
import { useSession, getSession } from "next-auth/react";
import { GetServerSideProps } from 'next';
import prisma from '../lib/prisma';
import SettingsTextField from "../components/SettingsText";
import { TransitionProps } from "@mui/material/transitions";
import { useTheme } from "@mui/system";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Slide,
    FormGroup,
} from '@mui/material';
import { Account } from "@prisma/client";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
    const session = await getSession({ req });
    if (!session) {
        res.statusCode = 403;
        return {
            props: {
                account: { name: 'hello' },
                readOnlyVals: { name: true },
            }
        };
    }
    const account = await prisma.user.findUnique({
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
    const newReadOnly = Object.keys(account).forEach((key) => {
        readOnlyVals[key] = true;
    });

    return {
        props: {
            account,
            readOnlyVals
        }
    }
};
const Slider = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});


type Props = {
    account: Account
    readOnlyVals: any
}

const Settings: React.FC<Props> = ({ account, readOnlyVals }) => {
    const { data: session, status } = useSession();

    const [readOnlyTriggers, setReadOnlyTriggers] = useState(readOnlyVals);

    const submitData = async (e, { componentName: textSubmission }) => {
        e.preventDefault();
        try {
            const body = {
                componentName: textSubmission
            };
            await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleReadOnlyChange = (key: string) => {
        const newReadOnlyVals = {};
        const newTrig = (readOnlyTriggers[key] === true) ? false : true;
        Object.keys(readOnlyTriggers).forEach((key) => newReadOnlyVals[key] = true);
        newReadOnlyVals[key] = newTrig;

        setReadOnlyTriggers(newReadOnlyVals)
        console.log(newReadOnlyVals)
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
                        {Object.keys(account).map((setting) => {
                            return (
                                <SettingsTextField
                                    key={'setting_' + setting}
                                    handleReadOnlyChange={handleReadOnlyChange}
                                    readOnlyVal={readOnlyTriggers[setting]}
                                    initialValue={account[setting]}
                                    componentName={setting}
                                    submitData={submitData}
                                ></SettingsTextField>
                            )
                        })}
                    </FormGroup>
                </DialogContent>
            </Dialog>
        </Layout>

    )
}

export default Settings