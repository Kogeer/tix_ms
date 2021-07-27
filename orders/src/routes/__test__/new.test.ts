import request from 'supertest';
import mongoose from "mongoose";
import {app} from "../../app";
import signin from "../../test/auth-helper";
import {Ticket} from "../../models/ticket";
import {Order, OrderStatus} from "../../models/order";

it('Returns an error if the ticket does not exist', async () => {
    const ticketId = mongoose.Types.ObjectId();

    await request(app)
        .post('/api/orders')
        .set('Cookie', signin())
        .send({
            ticketId
        })
        .expect(404);
});

it('Returns an error if the ticket is already reserved', async () => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 230
    });
    await ticket.save();
    const order = Order.build({
        ticket,
        userId: 'randomid',
        status: OrderStatus.Created,
        expiresAt: new Date()
    });
    await order.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', signin())
        .send({
            ticketId: ticket.id
        })
        .expect(400);
});

it('Reserves a ticket', async () => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 230
    });
    ticket.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', signin())
        .send({ ticketId: ticket.id })
        .expect(201);
});
