import pandas_datareader as pdr
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import load_model


class LSTMModel:
    def __init__(self, model_path="your model"):
        # Load the pre-trained LSTM model
        self.model = load_model(model_path)

        # Alpha Vantage API Key

        # Prepare stock data
        df1 = df.reset_index()[['open', 'close']]
        df1 = df1[['close']]

        # Scale the data between 0 and 1
        scaler = MinMaxScaler(feature_range=(0, 1))
        df1_scaled = scaler.fit_transform(np.array(df1).reshape(-1, 1))

        # Prepare input data for the LSTM model
        def create_dataset(dataset, time_step):
            dataX, dataY = [], []
            for i in range(len(dataset) - time_step - 1):
                a = dataset[i:(i + time_step), 0]
                dataX.append(a)
                dataY.append(dataset[i + time_step, 0])
            return np.array(dataX), np.array(dataY)

        # Split data into training and testing sets
        training_size = int(len(df1_scaled) * 0.8)
        train_data = df1_scaled[0:training_size, :]
        test_data = df1_scaled[training_size:, :]

        X_train, y_train = create_dataset(train_data, time_step)
        X_test, y_test = create_dataset(test_data, time_step)

        # Reshape input to 3D for LSTM
        X_train = X_train.reshape(X_train.shape[0], X_train.shape[1], 1)
        X_test = X_test.reshape(X_test.shape[0], X_test.shape[1], 1)

        # Prepare the latest `time_step` data for future predictions
        input_data = df1_scaled[-time_step:].reshape(1, time_step, 1)

        future_predictions = []
        for i in range(future_days):
            predicted_value = self.model.predict(input_data, verbose=0)
            future_predictions.append(predicted_value[0][0])
            input_data = np.append(input_data[:, 1:, :], predicted_value.reshape(1, 1, 1), axis=1)

        # Inverse transform predictions to original scale
        future_predictions = scaler.inverse_transform(np.array(future_predictions).reshape(-1, 1))

        return future_predictions, "Prediction successful!"

