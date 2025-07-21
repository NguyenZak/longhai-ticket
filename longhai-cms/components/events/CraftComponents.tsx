// CraftComponents.tsx
import React from 'react';
import { useNode } from '@craftjs/core';

export const Text = ({ text, fontSize = 14, textAlign = 'left' }) => {
  const { connectors: { connect, drag } } = useNode();
  
  return (
    <p 
      ref={ref => connect(drag(ref))}
      style={{ fontSize, textAlign }}
    >
      {text}
    </p>
  );
};

Text.craft = {
  displayName: 'Text',
  props: {
    text: 'Hello World',
    fontSize: 14,
    textAlign: 'left'
  }
};

// Similar structure for Container, Image, Button, Card components...