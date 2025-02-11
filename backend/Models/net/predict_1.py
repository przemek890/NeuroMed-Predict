import torch
import torch.nn as nn
""""""""""""""""""""""""""
class Model_1(nn.Module):
    def __init__(self):
        super(Model_1, self).__init__()
        self.hidden1 = nn.Linear(21, 15)
        self.bn1 = nn.BatchNorm1d(15)
        self.dropout1 = nn.Dropout(p=0.3)
        self.act1 = nn.LeakyReLU(negative_slope=0.01)

        self.hidden2 = nn.Linear(15, 10)
        self.bn2 = nn.BatchNorm1d(10)
        self.dropout2 = nn.Dropout(p=0.3)
        self.act2 = nn.LeakyReLU(negative_slope=0.01)

        self.hidden3 = nn.Linear(10, 5)
        self.bn3 = nn.BatchNorm1d(5)
        self.dropout3 = nn.Dropout(p=0.3)
        self.act3 = nn.LeakyReLU(negative_slope=0.01)

        self.output = nn.Linear(5, 1)

    def forward(self, x):
        x = self.act1(self.dropout1(self.bn1(self.hidden1(x))))
        x = self.act2(self.dropout2(self.bn2(self.hidden2(x))))
        x = self.act3(self.dropout3(self.bn3(self.hidden3(x))))
        x = self.output(x)
        return x