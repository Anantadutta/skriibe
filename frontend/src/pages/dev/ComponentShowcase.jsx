import React from 'react';
import { Button } from '../../components/ama/ui/Button';
import { Badge } from '../../components/ama/ui/Badge';
import { Avatar } from '../../components/ama/ui/Avatar';
import { LivePulse } from '../../components/ama/ui/LivePulse';
import { StatCard } from '../../components/ama/ui/StatCard';
import { Field } from '../../components/ama/ui/Field';
import { SLABadge } from '../../components/ama/ui/SLABadge';
import { CharCounter } from '../../components/ama/ui/CharCounter';
import { PhoneFrame } from '../../components/ama/layout/PhoneFrame';
import { PageWrapper } from '../../components/ama/layout/PageWrapper';

export default function ComponentShowcase() {
  return (
    <PageWrapper>
      <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '40px' }}>Component Showcase</h1>
        
        <section style={{ marginBottom: '40px' }}>
          <h3 style={{ fontFamily: 'var(--font-mono)' }}>Buttons</h3>
          <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
            <div style={{ width: '200px' }}><Button variant="primary">Ask Now →</Button></div>
            <div style={{ width: '200px' }}><Button variant="secondary">Continue</Button></div>
            <div style={{ width: '200px' }}><Button variant="danger">Reject question</Button></div>
            <div style={{ width: '200px' }}><Button variant="success">Send reply</Button></div>
            
            <div style={{ width: '200px' }}><Button variant="primary" disabled>Ask Now → (disabled)</Button></div>
            <div style={{ width: '200px' }}><Button variant="secondary" disabled>Continue (disabled)</Button></div>
            <div style={{ width: '200px' }}><Button variant="danger" disabled>Reject (disabled)</Button></div>
            <div style={{ width: '200px' }}><Button variant="success" disabled>Send reply (disabled)</Button></div>
          </div>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h3 style={{ fontFamily: 'var(--font-mono)' }}>Badges</h3>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <Badge variant="blue">NEW</Badge>
            <Badge variant="green">LIVE</Badge>
            <Badge variant="red">URGENT</Badge>
            <Badge variant="amber">PENDING</Badge>
            <Badge variant="purple">PRO</Badge>
          </div>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h3 style={{ fontFamily: 'var(--font-mono)' }}>Avatar</h3>
          <div style={{ display: 'flex', gap: '20px', marginTop: '20px', alignItems: 'center' }}>
            <Avatar name="Rahul Finance" size={52} />
            <Avatar name="Priya Fitness" size={52} src="https://i.pravatar.cc/150?img=47" />
          </div>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h3 style={{ fontFamily: 'var(--font-mono)' }}>LivePulse</h3>
          <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LivePulse /> 
            <span style={{ color: 'var(--green)', fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700 }}>LIVE</span>
          </div>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h3 style={{ fontFamily: 'var(--font-mono)' }}>StatCard</h3>
          <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
            <StatCard value="94%" label="REPLY" />
            <StatCard value="3.2h" label="AVG" />
            <StatCard value="247" label="ANSWERED" />
          </div>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h3 style={{ fontFamily: 'var(--font-mono)' }}>Field</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px', maxWidth: '400px' }}>
            <Field label="Email address" value="amit@gmail.com" />
            <Field label="Your question" value="Ask anything..." placeholder />
          </div>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h3 style={{ fontFamily: 'var(--font-mono)' }}>SLABadge</h3>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <SLABadge hoursRemaining={20} />
            <SLABadge hoursRemaining={10} />
            <SLABadge hoursRemaining={3} />
          </div>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h3 style={{ fontFamily: 'var(--font-mono)' }}>CharCounter</h3>
          <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
            <CharCounter count={0} min={20} max={500} />
            <CharCounter count={50} min={20} max={500} />
          </div>
        </section>
      </div>

      <div style={{ padding: '40px', background: 'var(--ink)' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--white)', fontFamily: 'var(--font-mono)' }}>PhoneFrame Demo</h3>
        <PhoneFrame>
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--green)', display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
            PhoneFrame working ✓
          </div>
        </PhoneFrame>
      </div>
    </PageWrapper>
  );
}
