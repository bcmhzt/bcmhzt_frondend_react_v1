import React from 'react';
import {
  PersonStanding,
  PersonStandingDress,
  // PersonArmsUp,
  PersonWalking,
} from 'react-bootstrap-icons';

type GenderIconProps = { genderId: string };

const GetGenderIcon: React.FC<GenderIconProps> = ({ genderId }) => {
  if (genderId === '1')
    return (
      <>
        <PersonStanding style={{ color: 'mediumblue' }} />
        男性
      </>
    );
  if (genderId === '2')
    return (
      <>
        <PersonStandingDress style={{ color: 'crimson' }} />
        女性
      </>
    );
  return (
    <>
      <PersonWalking style={{ color: 'green' }} />
      non-binary
    </>
  );
};

export default GetGenderIcon;
