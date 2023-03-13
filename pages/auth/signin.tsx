import { ProviderConfig } from "next-auth-mui"
import { BuiltInProviderType } from "next-auth/providers"
import { signIn, useSession } from "next-auth/react"
import { AppProps } from "next/app"
import { Provider, useEffect } from "react"
import * as React from 'react';
import { CssVarsProvider } from '@mui/joy/styles';
import Sheet from '@mui/joy/Sheet';
import Typography from "@mui/joy/Typography"
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Button from '@mui/joy/Button';
import Link from '@mui/joy/Link';
import GoogleButton from "react-google-button"
import { Container, ThemeProvider } from "@mui/system"
import theme from "../../styles/theme"
import Header from "../../components/Header"

export default function SignInButton({ props, theme }) {


  return (
    <>
      <Header />
      <CssVarsProvider>
        <Sheet
          variant="outlined"
          sx={{
            width: 300,
            mx: 'auto', // margin left & right
            my: 4, // margin top & botom
            py: 3, // padding top & bottom
            px: 2, // padding left & right
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            borderRadius: 'sm',
            boxShadow: 'md',
          }}
        >
          <div>
            <Typography>
              Welcome!
            </Typography>
          </div>
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input
              // html input attribute
              name="email"
              type="email"
              placeholder="johndoe@email.com"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input
              name="password"
              type="password"
              placeholder="password"
            />
          </FormControl>
          <Button sx={{ mt: 1 /* margin top */ }}>
            Log in
          </Button>
          <Container
            disableGutters={true}
            sx={{
              display: 'flex',
              alignSelf: 'center',
              alignItems: 'center',
              flexDirection: 'column'
            }}
          >
            <GoogleButton
              type="light" // can be light or dark
              onClick={() => { signIn("google", { callbackUrl: '/' }) }}
            />
          </Container>
          <Typography
            endDecorator={<Link href="/sign-up">Sign up</Link>}
            fontSize="sm"
            sx={{ alignSelf: 'center' }}
          >
            Don't have an account?
          </Typography>
        </Sheet>
      </CssVarsProvider>
    </>
  );
}
