﻿using System;
using System.Collections.Generic;
using NLog;
using NzbDrone.Core.Lifecycle;
using NzbDrone.Core.Messaging.Commands;
using NzbDrone.Core.Messaging.Events;

namespace NzbDrone.Core.Housekeeping
{
    public class HousekeepingService : IExecute<HousekeepingCommand>, IHandleAsync<ApplicationStartedEvent>
    {
        private readonly IEnumerable<IHousekeepingTask> _housekeepers;
        private readonly Logger _logger;

        public HousekeepingService(IEnumerable<IHousekeepingTask> housekeepers, Logger logger)
        {
            _housekeepers = housekeepers;
            _logger = logger;
        }

        private void Clean()
        {
            _logger.Info("Running housecleaning tasks");

            foreach (var housekeeper in _housekeepers)
            {
                try
                {
                    housekeeper.Clean();
                }
                catch (Exception ex)
                {
                    _logger.ErrorException("Error running housekeeping task: " + housekeeper.GetType().FullName, ex);
                }
            }
        }

        public void Execute(HousekeepingCommand message)
        {
            Clean();
        }

        public void HandleAsync(ApplicationStartedEvent message)
        {
            Clean();
        }
    }
}
