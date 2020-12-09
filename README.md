# Composable Microservices

Cf. [Clean Micoservices: Building Composable Microservices with Module Federation](https://trmidboe.medium.com/clean-microservices-building-composable-microservices-with-module-federation-f1d2b03d2b27)

Using module federation (a la [Zack Jackson](https://github.com/ScriptedAlchemy)) and clean architecture (a la Uncle Bob), composable microservices combine the independence and agility of microservices with the integration and deployment simplicity of monoliths. This simple API framework supports CRUD operations for domain models whose source code, and that of any dependencies, is streamed over HTTP from a remote server at runtime. Following hexagonal architecture, the framework can be configured to generate ports and bind them dynamically to local or federated adapters. Similarly, adapters can be wired to remotely imported services at runtime. Ports can be piped together to form control flows by configuring the output event of one port as the input or triggering event of another. The history of port invocations is recorded so compensating flows are generated automatically.

The sample code in [composable-microservices-remotes](https://github.com/tysonrm/federated-monolith-services) shows a domain object, Order, whose ports are bound to a payment, inventory, and shipping service. The ports are configured to participate in a control flow that implements the saga orchestrator pattern to manage an order process from beginning to end.
