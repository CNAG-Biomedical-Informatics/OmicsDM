
import React from "react";
import {mount} from '@cypress/react'
import Submission from '../Submission';
import Management from '../Management';

it('renders Submission', () => {
    mount(<Submission />);
});

it('renders Management', () => {
    mount(<Management />);
});