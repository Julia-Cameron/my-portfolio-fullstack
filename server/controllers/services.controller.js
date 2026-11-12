import Service from '../models/services.js';

const sendError = (res, error) => {
    const status = error.name === 'ValidationError' ? 400 : 500;
    res.status(status).json({ message: error.message });
};

// Get all services
export const getServices = async (req, res) => {
    try {
        const services = await Service.find();
        res.status(200).json(services);
    } catch (error) {
        sendError(res, error);
    }
};

// Get a service by ID
export const getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.status(200).json(service);
    } catch (error) {
        sendError(res, error);
    }
};

// Create a new service
export const createService = async (req, res) => {
    try {
        const service = new Service(req.body);
        await service.save();
        res.status(201).json(service);
    } catch (error) {
        sendError(res, error);
    }
};

// Update a service by ID
export const updateService = async (req, res) => {
    try {
        const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.status(200).json(service);
    } catch (error) {
        sendError(res, error);
    }
};

// Delete a service by ID
export const deleteService = async (req, res) => {
    try {
        const service = await Service.findByIdAndDelete(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.status(200).json({ message: 'Service deleted successfully' });
    } catch (error) {
        sendError(res, error);
    }
};

// Delete all services
export const deleteAllServices = async (req, res) => {
    try {
        await Service.deleteMany();
        res.status(200).json({ message: 'All services deleted successfully' });
    } catch (error) {
        sendError(res, error);
    }
};
