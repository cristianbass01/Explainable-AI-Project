import React from 'react';
import { Grid, Typography, Container, Card, Divider } from '@mui/material/';
import logo from './../images/logo.png';
import faq from './../images/faq.png';
import aiImage from './../images/robotic-hand.png';

const Home = () => {
  return (
    <Grid container style={{ alignItems: 'center', display: 'flex', justifyContent: 'center' }} backgroundColor='#2056A9'>
      <Grid container style={{ minHeight: '80vh', alignItems: 'center', justifyContent: 'center'}}  backgroundColor="#0B2230">
        <Grid item xs={2.5} >
          <img src={logo} alt="logo" style={{ width: '100%', height: 'auto' }} />
        </Grid>
        <Grid item xs={5}>
          <Typography variant="h2" align="center" style={{ marginBottom: '30px'}} color="whitesmoke">
            Welcome to <br /> <b>Cat</b>terfactual Ex<b>miao</b>nations
          </Typography>
          <Typography variant="h4" align="center" color='#2ABBFF'>
            A tool for generating counterfactual explanations <br /> for your machine learning models
          </Typography>
        </Grid>
        <Grid item xs={2.5}>
          <img src={logo} alt="logo" style={{ width: '100%', height: 'auto' }} />
        </Grid>
      </Grid>
      <Card style={{ backgroundColor: 'white', margin: '-100px 50px 50px 50px', maxWidth: '1200px', padding: '50px 20px 50px 20px'}}>
        <Container>
          <Grid container style={{ marginBottom: '50px' }}>
            <Grid item xs={7}>
              <Typography variant="h4" style={{ marginBottom: '20px' }} color='primary'>What is a Counterfactual Explanation?</Typography>
              <Typography variant="h6" style={{ marginBottom: '20px', textAlign:'justify' }}>
              A counterfactual explanation describes how a particular outcome would change if certain aspects of the input were altered. It essentially answers the "What if?" question by showing what minimal changes to the input data would have led to a different outcome.
              </Typography>
              <Typography variant="h5" color='primary' >Example scenario :</Typography>
              <Typography variant="h6" style={{ marginBottom: '20px', textAlign:'justify' }}>
                Imagine you applied for a loan and it was denied. A counterfactual explanation would tell you what specific changes (like a higher income or a better credit score) would have resulted in your loan being approved.
              </Typography>
            </Grid>
            <Grid item  xs={5} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img src={faq} alt="logo" style={{ width: '50%', height: 'auto' }} />
            </Grid>
          </Grid>
          <Divider style={{ marginBottom: '50px' }} />
          <Grid container style={{ marginBottom: '50px' }}>
            <Grid item xs={5} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img src={aiImage} alt="logo" style={{ width: '50%', height: 'auto' }} />
            </Grid>
            <Grid item xs={7}>
              <Typography variant="h4" style={{ marginBottom: '20px' }} color='primary'>Why our application?</Typography>
              <Typography variant="h6" style={{ marginBottom: '20px', textAlign:'justify' }}>
                Our product is designed to help you understand and improve decisions made by various models quickly and easily. Whether you're working with different types of models or datasets, our tool can generate clear counterfactuals.<br/> 
              </Typography>
              <Typography variant="h6" style={{ marginBottom: '20px', textAlign:'justify' }}>
                By using our tool, you can gain valuable insights, make better decisions, and ensure fairness in automated systems without any hassle.
              </Typography>
            </Grid>
          </Grid>
          <Divider style={{ marginBottom: '30px' }} />
          <Grid container style={{ marginBottom: '20px',  alignItems: 'center', display: 'flex', justifyContent: 'center' }}>
            <Grid item xs={12}>
              <Typography variant="h4" align="center" style={{ marginBottom: '20px' }} color='primary'>Getting started</Typography>
              <Typography variant="h5" align="center" style={{ marginBottom: '20px' }}>
                Are you ready to start this amazing journey? <br/>
                </Typography>
              <Typography variant="h5" align="center" style={{ marginBottom: '20px' }} color='secondary'>
                Click on the "Upload" button to upload your dataset and model or  <br/> 
                at the "Select" button to choose pre-loaded ones.
                </Typography>
              <Typography variant="h5" align="center" style={{ marginBottom: '20px' }}>
                Then insert your original input and let the magic happen!
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Card>
    </Grid>
  );
};

export default Home;

